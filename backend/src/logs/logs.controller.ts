import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog } from './entities/log.entity';
import { User } from '../auth/user.entity';
import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('logs')
@UseGuards(AuthGuard, RolesGuard)
@Roles('superadmin')
export class LogsController {
  constructor(
    @InjectRepository(SystemLog)
    private readonly logRepo: Repository<SystemLog>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepo: Repository<Business>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  @Get()
  async findAll(@Query('limit') limit = '50') {
    const parsed = Number(limit) || 50;
    return this.logRepo.find({ order: { id: 'DESC' }, take: parsed });
  }

  @Get('metrics')
  async metrics() {
    const [totalUsers, totalCustomers, totalBusinesses, totalAppointments] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { role: 'client' } }),
      this.businessRepo.count(),
      this.appointmentRepo.count(),
    ]);

    return {
      totalUsers,
      totalCustomers,
      totalBusinesses,
      totalAppointments,
    };
  }
}
