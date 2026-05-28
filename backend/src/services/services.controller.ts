import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ServicesService } from './services.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findByBusiness(@Query('businessId') businessId: string) {
    if (!businessId) {
      return [];
    }
    return this.servicesService.findByBusiness(Number(businessId));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.servicesService.findOne(Number(id));
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() body: any, @Req() req: any) {
    return this.servicesService.create(body, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.servicesService.update(Number(id), body, req.user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.servicesService.delete(Number(id), req.user.userId);
  }
}
