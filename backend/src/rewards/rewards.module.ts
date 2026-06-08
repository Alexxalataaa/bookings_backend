import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { Reward } from './reward.entity';
import { Business } from '../businesses/business.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reward, Business])],
  controllers: [RewardsController],
  providers: [RewardsService],
  exports: [RewardsService],
})
export class RewardsModule {}
