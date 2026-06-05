import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CustomersService, CustomerResponse } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from '../auth/auth.guard';


@Controller('customers')
@UseGuards(AuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Req() req: any): Promise<CustomerResponse[]> {
    return this.customersService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CustomerResponse> {
    return this.customersService.findOne(id);
  }

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerResponse> {
    return this.customersService.create(createCustomerDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponse> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any): Promise<void> {
    return this.customersService.remove(id, req.user);
  }
}
