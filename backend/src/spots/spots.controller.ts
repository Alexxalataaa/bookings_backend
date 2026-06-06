import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SpotsService } from './spots.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../businesses/business.entity';

@ApiTags('spots')
@Controller('spots')
export class SpotsController {
  constructor(
    private readonly spotsService: SpotsService,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get spots for a business, optionally filtered by date/time availability' })
  async findAll(
    @Query('businessId', ParseIntPipe) businessId: number,
    @Query('date') date?: string,
    @Query('time') time?: string,
  ) {
    return this.spotsService.findByBusiness(businessId, date, time);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a spot (business admin or superadmin)' })
  async create(@Body() body: any, @Request() req: any) {
    const ownerBusinessIds = await this.getOwnerBusinessIds(req.user);
    return this.spotsService.create(body, req.user.userId, ownerBusinessIds);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a spot' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Request() req: any,
  ) {
    const ownerBusinessIds = await this.getOwnerBusinessIds(req.user);
    return this.spotsService.update(id, body, ownerBusinessIds);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a spot' })
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const ownerBusinessIds = await this.getOwnerBusinessIds(req.user);
    return this.spotsService.remove(id, ownerBusinessIds);
  }

  /** Returns list of business IDs owned by the requesting user (or all if superadmin) */
  private async getOwnerBusinessIds(user: any): Promise<number[]> {
    const isSuperadmin = user.role === 'superadmin' || user.username === 'admin';
    if (isSuperadmin) {
      const all = await this.businessRepository.find({ select: ['id'] });
      return all.map((b) => b.id);
    }
    const owned = await this.businessRepository.find({
      where: { owner: { id: user.userId } },
      relations: ['owner'],
      select: ['id'],
    });
    return owned.map((b) => b.id);
  }
}
