import { Injectable, NotFoundException, UnauthorizedException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spot } from './spot.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Business } from '../businesses/business.entity';

// Default spots per business category
function defaultSpotsForCategory(category: string): Array<{ name: string; label: string; color: string }> {
  const cat = (category || '').toLowerCase();

  if (cat.includes('peluquer') || cat.includes('barber') || cat.includes('salon') || cat.includes('salón') || cat.includes('belleza') || cat.includes('estética')) {
    return [
      { name: 'Silla 1', label: 'S1', color: '#6366f1' },
      { name: 'Silla 2', label: 'S2', color: '#a855f7' },
      { name: 'Silla 3', label: 'S3', color: '#8b5cf6' },
      { name: 'Lavacabezas', label: 'LV', color: '#3b82f6' },
    ];
  }
  if (cat.includes('spa') || cat.includes('masaje') || cat.includes('wellness') || cat.includes('relax')) {
    return [
      { name: 'Camilla 1', label: 'C1', color: '#10b981' },
      { name: 'Camilla 2', label: 'C2', color: '#34d399' },
      { name: 'Cabina VIP', label: 'VIP', color: '#f59e0b' },
    ];
  }
  if (cat.includes('cowork') || cat.includes('oficina') || cat.includes('despacho') || cat.includes('trabajo')) {
    return [
      { name: 'Mesa A', label: 'MA', color: '#3b82f6' },
      { name: 'Mesa B', label: 'MB', color: '#60a5fa' },
      { name: 'Sala Reuniones', label: 'SR', color: '#f43f5e' },
      { name: 'Cabina Privada', label: 'CP', color: '#a855f7' },
    ];
  }
  if (cat.includes('médico') || cat.includes('medico') || cat.includes('clínica') || cat.includes('clinica') || cat.includes('salud')) {
    return [
      { name: 'Consulta 1', label: 'C1', color: '#10b981' },
      { name: 'Consulta 2', label: 'C2', color: '#34d399' },
    ];
  }
  if (cat.includes('dentista') || cat.includes('dental') || cat.includes('odonto')) {
    return [
      { name: 'Sillón 1', label: 'D1', color: '#3b82f6' },
      { name: 'Sillón 2', label: 'D2', color: '#60a5fa' },
    ];
  }
  if (cat.includes('fotograf') || cat.includes('estudio')) {
    return [
      { name: 'Estudio Principal', label: 'EP', color: '#f43f5e' },
      { name: 'Estudio Exterior', label: 'EX', color: '#f59e0b' },
      { name: 'Set Maquillaje', label: 'MQ', color: '#ec4899' },
    ];
  }
  if (cat.includes('fitnes') || cat.includes('gimnasio') || cat.includes('gym') || cat.includes('yoga') || cat.includes('pilates')) {
    return [
      { name: 'Zona A', label: 'ZA', color: '#f59e0b' },
      { name: 'Zona B', label: 'ZB', color: '#ef4444' },
      { name: 'Sala Grupal', label: 'SG', color: '#10b981' },
    ];
  }
  // Default for any other category
  return [
    { name: 'Puesto 1', label: 'P1', color: '#6366f1' },
    { name: 'Puesto 2', label: 'P2', color: '#a855f7' },
  ];
}

@Injectable()
export class SpotsService implements OnModuleInit {
  private readonly logger = new Logger(SpotsService.name);

  constructor(
    @InjectRepository(Spot)
    private readonly spotRepository: Repository<Spot>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  /** Auto-seed default spots for businesses that have none */
  async onModuleInit() {
    try {
      const businesses = await this.businessRepository.find();
      let seeded = 0;

      for (const biz of businesses) {
        const existingCount = await this.spotRepository.count({ where: { businessId: biz.id } });
        if (existingCount > 0) continue;

        const defaults = defaultSpotsForCategory(biz.category || '');
        const positions = [
          { posX: 0, posY: 0 }, { posX: 1, posY: 0 },
          { posX: 2, posY: 0 }, { posX: 3, posY: 0 },
        ];

        for (let i = 0; i < defaults.length; i++) {
          const pos = positions[i] ?? { posX: i, posY: 0 };
          await this.spotRepository.save(
            this.spotRepository.create({
              name: defaults[i].name,
              label: defaults[i].label,
              color: defaults[i].color,
              posX: pos.posX,
              posY: pos.posY,
              businessId: biz.id,
            }),
          );
          seeded++;
        }
      }

      if (seeded > 0) {
        this.logger.log(`✅ Auto-seeded ${seeded} default spots across businesses`);
      }
    } catch (err) {
      this.logger.warn(`Spot seeding skipped: ${err}`);
    }
  }

  async findByBusiness(businessId: number, date?: string, time?: string): Promise<(Spot & { available: boolean })[]> {
    const spots = await this.spotRepository.find({
      where: { businessId },
      order: { posY: 'ASC', posX: 'ASC' },
    });

    if (!date || !time) {
      return spots.map(s => ({ ...s, available: true }));
    }

    const taken = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .select('appointment.spotId')
      .where('appointment.businessId = :businessId', { businessId })
      .andWhere('appointment.date = :date', { date })
      .andWhere('appointment.time = :time', { time })
      .andWhere('appointment.spotId IS NOT NULL')
      .andWhere('appointment.status != :cancelled', { cancelled: 'cancelled' })
      .getMany();

    const takenIds = new Set(taken.map(a => a.spotId));

    return spots.map(s => ({
      ...s,
      available: !takenIds.has(s.id),
    }));
  }

  async isSpotAvailable(spotId: number, date: string, time: string): Promise<boolean> {
    const count = await this.appointmentRepository.count({
      where: { spotId, date, time } as any,
    });
    return count === 0;
  }

  async create(data: Partial<Spot>, ownerId: number, ownerBusinessIds: number[]): Promise<Spot> {
    if (!ownerBusinessIds.includes(data.businessId!)) {
      throw new UnauthorizedException('No tienes permisos para este negocio.');
    }
    const spot = this.spotRepository.create(data);
    return this.spotRepository.save(spot);
  }

  async update(id: number, data: Partial<Spot>, ownerBusinessIds: number[]): Promise<Spot> {
    const spot = await this.spotRepository.findOne({ where: { id } });
    if (!spot) throw new NotFoundException('Puesto no encontrado.');
    if (!ownerBusinessIds.includes(spot.businessId)) {
      throw new UnauthorizedException('No tienes permisos para este negocio.');
    }
    const updated = this.spotRepository.merge(spot, data);
    return this.spotRepository.save(updated);
  }

  async remove(id: number, ownerBusinessIds: number[]): Promise<{ success: boolean }> {
    const spot = await this.spotRepository.findOne({ where: { id } });
    if (!spot) throw new NotFoundException('Puesto no encontrado.');
    if (!ownerBusinessIds.includes(spot.businessId)) {
      throw new UnauthorizedException('No tienes permisos para este negocio.');
    }
    await this.spotRepository.remove(spot);
    return { success: true };
  }
}
