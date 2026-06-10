import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AuthModule } from '../auth/auth.module';
import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';
import { Service } from '../services/service.entity';
import { Spot } from '../spots/spot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Business, User, Service, Spot]), AuthModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}