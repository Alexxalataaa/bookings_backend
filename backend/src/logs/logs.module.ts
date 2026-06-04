import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemLog } from './entities/log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemLog])],
  controllers: [],
  providers: [],
  exports: [],
})
export class LogsModule {}
