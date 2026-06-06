import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../businesses/business.entity';
import { Service } from '../services/service.entity';
import { AppointmentsService } from '../appointments/appointments.service';

export type ConvStep =
  | 'IDLE'
  | 'ASK_BUSINESS'
  | 'ASK_SERVICE'
  | 'ASK_DATE'
  | 'ASK_TIME'
  | 'ASK_NAME'
  | 'CONFIRM'
  | 'BOOKED';

interface ConversationState {
  step: ConvStep;
  business?: Business;
  service?: Service;
  date?: string;
  time?: string;
  userName?: string;
  phoneNumber: string;
  lastActivity: number;
}

@Injectable()
export class WhatsappService {
  /** In-memory conversation states keyed by phone number */
  private conversations = new Map<string, ConversationState>();

  constructor(
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    private readonly appointmentsService: AppointmentsService,
  ) {
    // Clean up stale conversations every 10 minutes
    setInterval(() => this.cleanupStale(), 10 * 60 * 1000);
  }

  // ─── Public entry points ───────────────────────────────────────────────────

  /** Process an incoming WhatsApp message and return bot reply */
  async processMessage(phoneNumber: string, text: string): Promise<string> {
    const msg = text.trim().toLowerCase();
    let state = this.conversations.get(phoneNumber);

    // Initialize new state if none exists
    if (!state) {
      state = { step: 'IDLE', phoneNumber, lastActivity: Date.now() };
      this.conversations.set(phoneNumber, state);
    }

    state.lastActivity = Date.now();

    return this.handleStep(state, msg, text.trim());
  }

  /** Verify webhook token from Meta */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_TOKEN || 'krono_verify_token_2024';
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    return null;
  }

  /** Get all active conversation states (for admin panel) */
  getActiveSessions(): ConversationState[] {
    return Array.from(this.conversations.values())
      .filter((s) => s.step !== 'IDLE')
      .sort((a, b) => b.lastActivity - a.lastActivity)
      .slice(0, 50);
  }

  // ─── State Machine ─────────────────────────────────────────────────────────

  private async handleStep(state: ConversationState, msgLower: string, msgRaw: string): Promise<string> {
    // Global reset commands
    if (msgLower === 'cancelar' || msgLower === 'salir' || msgLower === 'exit') {
      this.resetState(state);
      return '❌ Reserva cancelada. Escribe *hola* cuando quieras volver a empezar.';
    }

    switch (state.step) {
      case 'IDLE':
        return this.handleIdle(state, msgLower);

      case 'ASK_BUSINESS':
        return this.handleAskBusiness(state, msgRaw);

      case 'ASK_SERVICE':
        return this.handleAskService(state, msgLower);

      case 'ASK_NAME':
        return this.handleAskName(state, msgRaw);

      case 'ASK_DATE':
        return this.handleAskDate(state, msgRaw);

      case 'ASK_TIME':
        return this.handleAskTime(state, msgRaw);

      case 'CONFIRM':
        return this.handleConfirm(state, msgLower);

      default:
        this.resetState(state);
        return this.greet();
    }
  }

  private handleIdle(state: ConversationState, msg: string): string {
    const triggers = ['hola', 'reservar', 'cita', 'reserva', 'book', 'hello', 'buenas', 'buenos días', 'buenas tardes'];
    if (triggers.some((t) => msg.includes(t))) {
      state.step = 'ASK_BUSINESS';
      return (
        `👋 ¡Hola! Bienvenido al *Asistente de Reservas Krono* 🗓️\n\n` +
        `Puedo ayudarte a reservar una cita en pocos segundos.\n\n` +
        `¿En qué negocio quieres reservar? Escribe el *nombre del negocio* (o parte de él).\n\n` +
        `_Escribe *cancelar* en cualquier momento para salir._`
      );
    }
    return this.greet();
  }

  private async handleAskBusiness(state: ConversationState, name: string): Promise<string> {
    const businesses = await this.businessRepo
      .createQueryBuilder('b')
      .where('LOWER(b.name) LIKE :q', { q: `%${name.toLowerCase()}%` })
      .andWhere('b.isSuspended = false')
      .leftJoinAndSelect('b.services', 'services')
      .getMany();

    if (businesses.length === 0) {
      return `🔍 No encontré ningún negocio con ese nombre. Intenta con otra palabra clave, o escribe *cancelar*.`;
    }

    if (businesses.length > 5) {
      return `🔍 Encontré demasiados resultados. Sé más específico con el nombre del negocio.`;
    }

    if (businesses.length === 1) {
      state.business = businesses[0];
      return this.askService(state);
    }

    // Multiple matches — let them pick
    const list = businesses.map((b, i) => `${i + 1}. *${b.name}* — ${b.city || b.category}`).join('\n');
    state.business = undefined;
    // Temporarily store candidates in state (we'll use a hacky approach)
    (state as any)._candidates = businesses;
    state.step = 'ASK_BUSINESS';
    return `Encontré varios negocios:\n\n${list}\n\nEscribe el *número* del que quieres reservar.`;
  }

  private async askService(state: ConversationState): Promise<string> {
    const services = state.business!.services || [];
    if (services.length === 0) {
      this.resetState(state);
      return `⚠️ Este negocio no tiene servicios disponibles todavía. Intenta con otro negocio o escribe *cancelar*.`;
    }

    state.step = 'ASK_SERVICE';
    const list = services.map((s, i) => `${i + 1}. *${s.name}* — ${s.duration} min · ${s.price}€`).join('\n');
    return (
      `✅ ¡Perfecto! Reserva en *${state.business!.name}*.\n\n` +
      `¿Qué servicio deseas?\n\n${list}\n\nEscribe el *número* del servicio.`
    );
  }

  private async handleAskService(state: ConversationState, msg: string): Promise<string> {
    const candidates: Business[] | undefined = (state as any)._candidates;
    
    // If we have candidates (multiple business matches), pick one first
    if (candidates && !state.business) {
      const num = parseInt(msg, 10);
      if (isNaN(num) || num < 1 || num > candidates.length) {
        return `Por favor escribe un número del 1 al ${candidates.length}.`;
      }
      // Reload with services relation
      const chosen = await this.businessRepo.findOne({
        where: { id: candidates[num - 1].id },
        relations: ['services'],
      });
      state.business = chosen!;
      delete (state as any)._candidates;
      return this.askService(state);
    }

    const services = state.business!.services || [];
    const num = parseInt(msg, 10);
    if (isNaN(num) || num < 1 || num > services.length) {
      return `Por favor escribe un número del 1 al ${services.length}.`;
    }
    state.service = services[num - 1];
    state.step = 'ASK_NAME';
    return `👤 ¿Cuál es tu *nombre completo*?`;
  }

  private handleAskName(state: ConversationState, name: string): string {
    if (name.length < 2) {
      return `Por favor escribe tu nombre completo.`;
    }
    state.userName = name;
    state.step = 'ASK_DATE';
    const today = new Date().toISOString().split('T')[0];
    return (
      `📅 ¿Para qué *fecha* quieres la cita?\n\n` +
      `Escribe en formato *DD/MM/AAAA* o *AAAA-MM-DD*.\n` +
      `_(Ejemplo: 15/06/2026 o 2026-06-15)_`
    );
  }

  private handleAskDate(state: ConversationState, raw: string): string {
    const date = this.parseDate(raw);
    if (!date) {
      return `❌ No entendí la fecha. Escríbela en formato *DD/MM/AAAA* (ejemplo: 20/06/2026).`;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return `⚠️ Esa fecha ya ha pasado. Por favor elige una fecha *futura*.`;
    }

    state.date = date.toISOString().split('T')[0];
    state.step = 'ASK_TIME';
    return (
      `⏰ ¿A qué *hora* prefieres la cita?\n\n` +
      `Escríbela en formato *HH:MM* (ejemplo: 10:30 o 16:00).`
    );
  }

  private handleAskTime(state: ConversationState, raw: string): string {
    const timeMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
    if (!timeMatch) {
      return `❌ Formato incorrecto. Escribe la hora como *HH:MM* (ejemplo: 10:30).`;
    }

    const h = parseInt(timeMatch[1], 10);
    const m = parseInt(timeMatch[2], 10);
    if (h < 0 || h > 23 || m < 0 || m > 59) {
      return `❌ Hora inválida. Por favor escribe una hora válida.`;
    }

    state.time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    state.step = 'CONFIRM';

    return (
      `📋 *Resumen de tu reserva:*\n\n` +
      `🏢 Negocio: *${state.business!.name}*\n` +
      `💆 Servicio: *${state.service!.name}*\n` +
      `📅 Fecha: *${this.formatDate(state.date!)}*\n` +
      `⏰ Hora: *${state.time}*\n` +
      `👤 Nombre: *${state.userName}*\n` +
      `💰 Precio: *${state.service!.price}€*\n\n` +
      `¿Confirmas la reserva? Escribe *sí* para confirmar o *no* para cancelar.`
    );
  }

  private async handleConfirm(state: ConversationState, msg: string): Promise<string> {
    if (msg === 'no' || msg === 'cancelar') {
      this.resetState(state);
      return `❌ Reserva cancelada. Escribe *hola* cuando quieras intentarlo de nuevo.`;
    }

    if (!['sí', 'si', 'yes', 'confirmar', 'confirmo', 'ok', 'vale'].includes(msg)) {
      return `Por favor escribe *sí* para confirmar o *no* para cancelar.`;
    }

    try {
      // Create a mock user context for the appointments service
      const mockUser = { userId: 999, role: 'client', username: 'whatsapp_bot' };

      await this.appointmentsService.create({
        date: state.date!,
        time: state.time!,
        status: 'pending' as any,
        businessId: state.business!.id,
        serviceName: state.service!.name,
        serviceId: state.service!.id,
        customerId: undefined,
        userId: 999, // guest user placeholder
      } as any);

      const reply =
        `🎉 *¡Reserva confirmada!*\n\n` +
        `Tu cita en *${state.business!.name}* ha sido registrada correctamente.\n\n` +
        `📅 Fecha: *${this.formatDate(state.date!)}*\n` +
        `⏰ Hora: *${state.time}*\n` +
        `💆 Servicio: *${state.service!.name}*\n\n` +
        `Recibirás un recordatorio antes de tu cita. ¡Hasta pronto! 👋`;

      state.step = 'BOOKED';
      this.conversations.set(state.phoneNumber, { ...state, step: 'IDLE' });

      return reply;
    } catch (err: any) {
      this.resetState(state);
      return `⚠️ Hubo un error al crear la reserva: ${err.message || 'Error desconocido'}. Por favor inténtalo de nuevo o contacta directamente con el negocio.`;
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private greet(): string {
    return (
      `👋 ¡Hola! Soy el asistente de reservas de *Krono*.\n\n` +
      `Escribe *hola* o *reservar* para comenzar a agendar tu cita. 🗓️`
    );
  }

  private resetState(state: ConversationState): void {
    state.step = 'IDLE';
    state.business = undefined;
    state.service = undefined;
    state.date = undefined;
    state.time = undefined;
    state.userName = undefined;
    delete (state as any)._candidates;
  }

  private parseDate(raw: string): Date | null {
    // Accept DD/MM/YYYY or YYYY-MM-DD
    const ddmmyyyy = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (ddmmyyyy) {
      const [, d, m, y] = ddmmyyyy;
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    const isoDate = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDate) {
      const [, y, m, d] = isoDate;
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    }
    return null;
  }

  private formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  private cleanupStale(): void {
    const cutoff = Date.now() - 30 * 60 * 1000; // 30 min
    for (const [phone, state] of this.conversations.entries()) {
      if (state.lastActivity < cutoff) {
        this.conversations.delete(phone);
      }
    }
  }
}
