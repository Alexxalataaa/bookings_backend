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

  findAll() {
    return this.appointmentsRepository.find({
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  findOne(id: number) {
    return this.appointmentsRepository.findOneBy({ id });
  }

  async create(createAppointmentDto: CreateAppointmentDto) {
    const appointment = this.appointmentsRepository.create(createAppointmentDto);
    const saved = await this.appointmentsRepository.save(appointment);
    this.notificationsGateway.sendNotification('Nueva reserva creada');
    return saved;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.appointmentsRepository.findOneBy({ id });

    if (!appointment) {
      throw new NotFoundException(`No existe la reserva con id ${id}`);
    }

    const updatedAppointment = this.appointmentsRepository.merge(
      appointment,
      updateAppointmentDto,
    );

    const saved = await this.appointmentsRepository.save(updatedAppointment);
    this.notificationsGateway.sendNotification('Reserva actualizada');
    return saved;
  }

  async remove(id: number) {
    const appointment = await this.appointmentsRepository.findOneBy({ id });

    if (!appointment) {
      throw new NotFoundException(`No existe la reserva con id ${id}`);
    }

    await this.appointmentsRepository.remove(appointment);
    this.notificationsGateway.sendNotification('Reserva eliminada');

    return { message: `Reserva ${id} eliminada correctamente` };
  }
}