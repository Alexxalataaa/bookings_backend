import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Business } from '../businesses/business.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  async findAll(user: { userId: number; role: string; username: string }, businessId?: number) {
    const isSuperadmin = user.username === 'admin' || user.role === 'superadmin';

    const query = this.appointmentsRepository.createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.business', 'business')
      .leftJoinAndSelect('appointment.service', 'service')
      .orderBy('appointment.date', 'ASC')
      .addOrderBy('appointment.time', 'ASC');

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

    const appointments = await query.getMany();
    return appointments.map(app => {
      if (app.status && (app.status.toString().toLowerCase() === 'pagada' || app.status.toString().toLowerCase() === 'paid')) {
        app.status = AppointmentStatus.PAID;
      }
      return app;
    });
  }

  async findOne(id: number) {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['user', 'business', 'service'],
    });
    if (!appointment) {
      throw new NotFoundException(`No existe la reserva con id ${id}`);
    }
    if (appointment.status && (appointment.status.toString().toLowerCase() === 'pagada' || appointment.status.toString().toLowerCase() === 'paid')) {
      appointment.status = AppointmentStatus.PAID;
    }
    return appointment;
  }

  async create(createAppointmentDto: CreateAppointmentDto & { userId?: number }) {
    // Check if business exists and is suspended
    const business = await this.businessRepository.findOne({
      where: { id: createAppointmentDto.businessId },
    });
    if (!business) {
      throw new NotFoundException('El negocio solicitado no existe.');
    }
    if (business.isSuspended) {
      throw new BadRequestException('No se pueden realizar reservas en un negocio suspendido.');
    }

    // Synchronize customerId and user relation
    const finalCustomerId = createAppointmentDto.userId || createAppointmentDto.customerId;

    let finalStatus = createAppointmentDto.status;
    if (finalStatus && (finalStatus.toString().toLowerCase() === 'pagada' || finalStatus.toString().toLowerCase() === 'paid')) {
      finalStatus = AppointmentStatus.PAID;
    }

    const appointment = this.appointmentsRepository.create({
      date: createAppointmentDto.date,
      time: createAppointmentDto.time,
      status: finalStatus as any,
      customerId: finalCustomerId,
      businessId: createAppointmentDto.businessId,
      serviceName: createAppointmentDto.serviceName,
      spotId: (createAppointmentDto as any).spotId || null,
      user: finalCustomerId ? { id: finalCustomerId } as any : null,
      business: { id: createAppointmentDto.businessId } as any,
      service: (createAppointmentDto as any).serviceId ? { id: (createAppointmentDto as any).serviceId } as any : null,
      spot: (createAppointmentDto as any).spotId ? { id: (createAppointmentDto as any).spotId } as any : null,
    });


    const saved = await this.appointmentsRepository.save(appointment);
    this.notificationsGateway.sendNotification('Nueva reserva creada');
    return saved;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.findOne(id);

    if (updateAppointmentDto.status && (updateAppointmentDto.status.toString().toLowerCase() === 'pagada' || updateAppointmentDto.status.toString().toLowerCase() === 'paid')) {
      updateAppointmentDto.status = AppointmentStatus.PAID;
    }

    const updatedAppointment = this.appointmentsRepository.merge(
      appointment,
      updateAppointmentDto as any,
    );

    const saved = await this.appointmentsRepository.save(updatedAppointment);
    if (saved.status && (saved.status.toString().toLowerCase() === 'pagada' || saved.status.toString().toLowerCase() === 'paid')) {
      saved.status = AppointmentStatus.PAID;
    }
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