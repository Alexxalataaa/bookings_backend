import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog } from './entities/log.entity';
import { User } from '../auth/user.entity';
import { Business } from '../businesses/business.entity';
import { Appointment, AppointmentStatus } from '../appointments/appointment.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(SystemLog)
    private logRepository: Repository<SystemLog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async logAction(action: string, entityName?: string, entityId?: string, userId?: number, details?: string) {
    const log = this.logRepository.create({
      action,
      entityName,
      entityId,
      userId,
      details,
    });
    return this.logRepository.save(log);
  }

  async getLogs(limit: number = 50) {
    return this.logRepository.find({
      order: { id: 'DESC' },
      take: limit,
    });
  }

  async getMetrics() {
    const totalUsers = await this.userRepository.count();
    const totalBusinesses = await this.businessRepository.count();
    const totalAppointments = await this.appointmentRepository.count();

    const pendingAppointments = await this.appointmentRepository.count({ where: { status: AppointmentStatus.PENDING } });
    const confirmedAppointments = await this.appointmentRepository.count({ where: { status: AppointmentStatus.CONFIRMED } });
    const paidAppointments = await this.appointmentRepository.count({ where: { status: AppointmentStatus.PAID } });
    const totalCustomers = await this.userRepository.count({ where: { role: 'client' }});

    return {
      totalUsers,
      totalBusinesses,
      totalCustomers,
      totalAppointments,
      appointmentsByStatus: {
        pending: pendingAppointments,
        confirmed: confirmedAppointments,
        paid: paidAppointments,
      },
    };
  }
}
