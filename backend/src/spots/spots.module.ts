import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpotsService } from './spots.service';
import { SpotsController } from './spots.controller';
import { Spot } from './spot.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Business } from '../businesses/business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Spot, Appointment, Business])],
  controllers: [SpotsController],
  providers: [SpotsService],
  exports: [SpotsService],
})
export class SpotsModule {}
