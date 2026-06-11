import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { AuthModule } from '../auth/auth.module';
import { Business } from '../businesses/business.entity';
import { RewardsModule } from '../rewards/rewards.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Business]), AuthModule, RewardsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}