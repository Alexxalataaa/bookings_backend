"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("../businesses/business.entity");
const service_entity_1 = require("../services/service.entity");
const appointments_service_1 = require("../appointments/appointments.service");
let WhatsappService = class WhatsappService {
    businessRepo;
    serviceRepo;
    appointmentsService;
    conversations = new Map();
    constructor(businessRepo, serviceRepo, appointmentsService) {
        this.businessRepo = businessRepo;
        this.serviceRepo = serviceRepo;
        this.appointmentsService = appointmentsService;
        setInterval(() => this.cleanupStale(), 10 * 60 * 1000);
    }
    async processMessage(phoneNumber, text) {
        const msg = text.trim().toLowerCase();
        let state = this.conversations.get(phoneNumber);
        if (!state) {
            state = { step: 'IDLE', phoneNumber, lastActivity: Date.now() };
            this.conversations.set(phoneNumber, state);
        }
        state.lastActivity = Date.now();
        return this.handleStep(state, msg, text.trim());
    }
    verifyWebhook(mode, token, challenge) {
        const verifyToken = process.env.WHATSAPP_TOKEN || 'krono_verify_token_2024';
        if (mode === 'subscribe' && token === verifyToken) {
            return challenge;
        }
        return null;
    }
    getActiveSessions() {
        return Array.from(this.conversations.values())
            .filter((s) => s.step !== 'IDLE')
            .sort((a, b) => b.lastActivity - a.lastActivity)
            .slice(0, 50);
    }
    async handleStep(state, msgLower, msgRaw) {
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
    handleIdle(state, msg) {
        const triggers = ['hola', 'reservar', 'cita', 'reserva', 'book', 'hello', 'buenas', 'buenos días', 'buenas tardes'];
        if (triggers.some((t) => msg.includes(t))) {
            state.step = 'ASK_BUSINESS';
            return (`👋 ¡Hola! Bienvenido al *Asistente de Reservas Krono* 🗓️\n\n` +
                `Puedo ayudarte a reservar una cita en pocos segundos.\n\n` +
                `¿En qué negocio quieres reservar? Escribe el *nombre del negocio* (o parte de él).\n\n` +
                `_Escribe *cancelar* en cualquier momento para salir._`);
        }
        return this.greet();
    }
    async handleAskBusiness(state, name) {
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
        const list = businesses.map((b, i) => `${i + 1}. *${b.name}* — ${b.city || b.category}`).join('\n');
        state.business = undefined;
        state._candidates = businesses;
        state.step = 'ASK_BUSINESS';
        return `Encontré varios negocios:\n\n${list}\n\nEscribe el *número* del que quieres reservar.`;
    }
    async askService(state) {
        const services = state.business.services || [];
        if (services.length === 0) {
            this.resetState(state);
            return `⚠️ Este negocio no tiene servicios disponibles todavía. Intenta con otro negocio o escribe *cancelar*.`;
        }
        state.step = 'ASK_SERVICE';
        const list = services.map((s, i) => `${i + 1}. *${s.name}* — ${s.duration} min · ${s.price}€`).join('\n');
        return (`✅ ¡Perfecto! Reserva en *${state.business.name}*.\n\n` +
            `¿Qué servicio deseas?\n\n${list}\n\nEscribe el *número* del servicio.`);
    }
    async handleAskService(state, msg) {
        const candidates = state._candidates;
        if (candidates && !state.business) {
            const num = parseInt(msg, 10);
            if (isNaN(num) || num < 1 || num > candidates.length) {
                return `Por favor escribe un número del 1 al ${candidates.length}.`;
            }
            const chosen = await this.businessRepo.findOne({
                where: { id: candidates[num - 1].id },
                relations: ['services'],
            });
            state.business = chosen;
            delete state._candidates;
            return this.askService(state);
        }
        const services = state.business.services || [];
        const num = parseInt(msg, 10);
        if (isNaN(num) || num < 1 || num > services.length) {
            return `Por favor escribe un número del 1 al ${services.length}.`;
        }
        state.service = services[num - 1];
        state.step = 'ASK_NAME';
        return `👤 ¿Cuál es tu *nombre completo*?`;
    }
    handleAskName(state, name) {
        if (name.length < 2) {
            return `Por favor escribe tu nombre completo.`;
        }
        state.userName = name;
        state.step = 'ASK_DATE';
        const today = new Date().toISOString().split('T')[0];
        return (`📅 ¿Para qué *fecha* quieres la cita?\n\n` +
            `Escribe en formato *DD/MM/AAAA* o *AAAA-MM-DD*.\n` +
            `_(Ejemplo: 15/06/2026 o 2026-06-15)_`);
    }
    handleAskDate(state, raw) {
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
        return (`⏰ ¿A qué *hora* prefieres la cita?\n\n` +
            `Escríbela en formato *HH:MM* (ejemplo: 10:30 o 16:00).`);
    }
    handleAskTime(state, raw) {
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
        return (`📋 *Resumen de tu reserva:*\n\n` +
            `🏢 Negocio: *${state.business.name}*\n` +
            `💆 Servicio: *${state.service.name}*\n` +
            `📅 Fecha: *${this.formatDate(state.date)}*\n` +
            `⏰ Hora: *${state.time}*\n` +
            `👤 Nombre: *${state.userName}*\n` +
            `💰 Precio: *${state.service.price}€*\n\n` +
            `¿Confirmas la reserva? Escribe *sí* para confirmar o *no* para cancelar.`);
    }
    async handleConfirm(state, msg) {
        if (msg === 'no' || msg === 'cancelar') {
            this.resetState(state);
            return `❌ Reserva cancelada. Escribe *hola* cuando quieras intentarlo de nuevo.`;
        }
        if (!['sí', 'si', 'yes', 'confirmar', 'confirmo', 'ok', 'vale'].includes(msg)) {
            return `Por favor escribe *sí* para confirmar o *no* para cancelar.`;
        }
        try {
            const mockUser = { userId: 999, role: 'client', username: 'whatsapp_bot' };
            await this.appointmentsService.create({
                date: state.date,
                time: state.time,
                status: 'pending',
                businessId: state.business.id,
                serviceName: state.service.name,
                serviceId: state.service.id,
                customerId: undefined,
                userId: 999,
            });
            const reply = `🎉 *¡Reserva confirmada!*\n\n` +
                `Tu cita en *${state.business.name}* ha sido registrada correctamente.\n\n` +
                `📅 Fecha: *${this.formatDate(state.date)}*\n` +
                `⏰ Hora: *${state.time}*\n` +
                `💆 Servicio: *${state.service.name}*\n\n` +
                `Recibirás un recordatorio antes de tu cita. ¡Hasta pronto! 👋`;
            state.step = 'BOOKED';
            this.conversations.set(state.phoneNumber, { ...state, step: 'IDLE' });
            return reply;
        }
        catch (err) {
            this.resetState(state);
            return `⚠️ Hubo un error al crear la reserva: ${err.message || 'Error desconocido'}. Por favor inténtalo de nuevo o contacta directamente con el negocio.`;
        }
    }
    greet() {
        return (`👋 ¡Hola! Soy el asistente de reservas de *Krono*.\n\n` +
            `Escribe *hola* o *reservar* para comenzar a agendar tu cita. 🗓️`);
    }
    resetState(state) {
        state.step = 'IDLE';
        state.business = undefined;
        state.service = undefined;
        state.date = undefined;
        state.time = undefined;
        state.userName = undefined;
        delete state._candidates;
    }
    parseDate(raw) {
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
    formatDate(iso) {
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    }
    cleanupStale() {
        const cutoff = Date.now() - 30 * 60 * 1000;
        for (const [phone, state] of this.conversations.entries()) {
            if (state.lastActivity < cutoff) {
                this.conversations.delete(phone);
            }
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(1, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        appointments_service_1.AppointmentsService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map