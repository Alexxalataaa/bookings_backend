import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemLog } from './entities/log.entity';
import { LogsController } from './logs.controller';
import { User } from '../auth/user.entity';
import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([SystemLog, User, Business, Appointment]), AuthModule],
  controllers: [LogsController],
  providers: [],
  exports: [],
})
export class LogsModule {}
