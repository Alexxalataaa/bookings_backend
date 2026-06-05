import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AuthModule } from '../auth/auth.module';
import { Business } from '../businesses/business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Business]), AuthModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}