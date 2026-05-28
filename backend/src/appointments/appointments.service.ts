import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(user: { userId: number; role: string; username: string }, businessId?: number) {
    const isSuperadmin = user.username === 'admin' || user.role === 'superadmin';

    const query = this.appointmentsRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.business', 'business')
      .leftJoinAndSelect('appointment.service', 'service')
      .order({ 'appointment.date': 'ASC', 'appointment.time': 'ASC' });

    if (isSuperadmin) {
      if (businessId) {
        query.andWhere('appointment.businessId = :businessId', { businessId });
      }
    } else if (user.role === 'business') {
      // Must filter by businesses owned by this owner
      query.leftJoin('business.owner', 'owner')
        .andWhere('owner.id = :ownerId', { ownerId: user.userId });
      
      if (businessId) {
        query.andWhere('appointment.businessId = :businessId', { businessId });
      }
    } else {
      // Client
      query.andWhere('appointment.user.id = :clientId', { clientId: user.userId });
    }

    return query.getMany();
  }

  async findOne(id: number) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['user', 'business', 'service'],
    });
    if (!appointment) {
      throw new NotFoundException(`No existe la reserva con id ${id}`);
    }
    return appointment;
  }

  async create(createAppointmentDto: CreateAppointmentDto & { userId?: number }) {
    const appointment = this.appointmentsRepository.create({
      date: createAppointmentDto.date,
      time: createAppointmentDto.time,
      status: createAppointmentDto.status as any,
      customerId: createAppointmentDto.customerId,
      businessId: createAppointmentDto.businessId,
      serviceName: createAppointmentDto.serviceName,
      user: createAppointmentDto.userId ? { id: createAppointmentDto.userId } as any : null,
      business: { id: createAppointmentDto.businessId } as any,
      service: (createAppointmentDto as any).serviceId ? { id: (createAppointmentDto as any).serviceId } as any : null,
    });

    const saved = await this.appointmentsRepository.save(appointment);
    this.notificationsGateway.sendNotification('Nueva reserva creada');
    return saved;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);

    const updatedAppointment = this.appointmentsRepository.merge(
      appointment,
      updateAppointmentDto as any,
    );

    const saved = await this.appointmentsRepository.save(updatedAppointment);
    this.notificationsGateway.sendNotification('Reserva actualizada');
    return saved;
  }

  async remove(id: number) {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
    this.notificationsGateway.sendNotification('Reserva eliminada');
    return { message: `Reserva ${id} eliminada correctamente` };
  }
}