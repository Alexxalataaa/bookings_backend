import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardsService } from './rewards.service';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get()
  findAll(@Query('businessId') businessId?: string) {
    return this.rewardsService.findAll(businessId ? Number(businessId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rewardsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() body: CreateRewardDto, @Req() req: any) {
    return this.rewardsService.create(body, req.user.userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateRewardDto, @Req() req: any) {
    return this.rewardsService.update(id, body, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.rewardsService.remove(id, req.user.userId);
  }
}
