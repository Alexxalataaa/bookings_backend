import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Spot } from './spot.entity';
import { Appointment } from '../appointments/appointment.entity';

@Injectable()
export class SpotsService {
  constructor(
    @InjectRepository(Spot)
    private readonly spotRepository: Repository<Spot>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  async findByBusiness(businessId: number, date?: string, time?: string): Promise<(Spot & { available: boolean })[]> {
    const spots = await this.spotRepository.find({
      where: { businessId },
      order: { posY: 'ASC', posX: 'ASC' },
    });

    if (!date || !time) {
      return spots.map(s => ({ ...s, available: true }));
    }

    // Find which spots are taken at this date+time
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
      where: {
        spotId,
        date,
        time,
      } as any,
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
