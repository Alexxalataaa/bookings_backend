import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesModule } from '../businesses/businesses.module';
import { AuthModule } from '../auth/auth.module';
import { Reward } from './reward.entity';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reward]), BusinessesModule, AuthModule],
  controllers: [RewardsController],
  providers: [RewardsService],
})
export class RewardsModule {}
