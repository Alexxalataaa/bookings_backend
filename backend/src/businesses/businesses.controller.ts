import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { BusinessesService } from './businesses.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  @Get()
  async findAll() {
    return this.businessesService.findAll();
  }

  @Get('all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('superadmin')
  async findAllAll() {
    return this.businessesService.findAllForSuperadmin();
  }

  @Get('my')
  @UseGuards(AuthGuard)
  async findMy(@Req() req: any) {
    return this.businessesService.findByOwner(req.user.userId);
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.businessesService.findOne(idOrSlug);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() body: any, @Req() req: any) {
    return this.businessesService.create(body, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const isSuperadmin = req.user.role === 'superadmin';
    return this.businessesService.update(Number(id), body, req.user.userId, isSuperadmin);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async delete(@Param('id') id: string, @Req() req: any) {
    const isSuperadmin = req.user.role === 'superadmin';
    return this.businessesService.delete(Number(id), req.user.userId, isSuperadmin);
  }
}
