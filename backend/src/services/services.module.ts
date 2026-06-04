import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './service.entity';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { BusinessesModule } from '../businesses/businesses.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Service]),
    BusinessesModule,
    AuthModule,
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
