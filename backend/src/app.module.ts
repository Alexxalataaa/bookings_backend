import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsModule } from './appointments/appointments.module';
import { CustomersModule } from './customers/customers.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { BusinessesModule } from './businesses/businesses.module';
import { ServicesModule } from './services/services.module';
import { LogsModule } from './logs/logs.module';
import { UsersModule } from './users/users.module';
import { SpotsModule } from './spots/spots.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/database.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    BusinessesModule,
    ServicesModule,
    AppointmentsModule,
    CustomersModule,
    PaymentsModule,
    NotificationsModule,
    LogsModule,
    UsersModule,
    SpotsModule,
    WhatsappModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
