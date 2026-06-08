import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { Reward } from './reward.entity';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  findAll(@Query('businessId') businessId?: string): Promise<Reward[]> {
    return this.rewardsService.findAll(businessId ? parseInt(businessId, 10) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Reward> {
    return this.rewardsService.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Reward> & { businessId: number }): Promise<Reward> {
    return this.rewardsService.create(data);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: Partial<Reward>): Promise<Reward> {
    return this.rewardsService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.rewardsService.delete(id);
  }
}
