import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AuthGuard } from '../auth/auth.guard';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(AuthGuard)
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
  ) {}

  @Get()
  @ApiOkResponse({ description: 'Listado de reservas' })
  findAll(@Req() req: any, @Query('businessId') businessId?: string) {
    return this.appointmentsService.findAll(
      req.user,
      businessId ? Number(businessId) : undefined,
    );
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Detalle de una reserva' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.findOne(id);
  }

  @Post()
  @ApiCreatedResponse({ description: 'Reserva creada' })
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req: any) {
    // Inject the logged-in user's ID into the booking creation flow
    const data = {
      ...createAppointmentDto,
      userId: req.user.userId,
    };
    return this.appointmentsService.create(data);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Reserva actualizada' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Reserva eliminada' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentsService.remove(id);
  }
}