import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  findAll(): Promise<Customer[]> {
    return this.customerRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const { name, email, phone } = createCustomerDto;

    if (phone) {
      const phoneStr = String(phone).trim();
      const digits = phoneStr.replace(/\D/g, "");
      if (digits.length !== 11) {
        throw new BadRequestException('El numero tiene que tener 9 digitos');
      }
      if (!/^\+\d{2} \d{3} \d{3} \d{3}$/.test(phoneStr)) {
        throw new BadRequestException('El formato del numero esta mal');
      }
    }

    const existingCustomers = await this.findAll();
    const isDuplicate = existingCustomers.some(c => 
      (c.name.toLowerCase() === name.toLowerCase()) ||
      (c.email && email && c.email.toLowerCase() === email.toLowerCase()) ||
      (c.phone && phone && c.phone === phone)
    );

    if (isDuplicate) {
      const duplicatePhone = existingCustomers.some(c => c.phone && phone && c.phone === phone);
      if (duplicatePhone) {
        throw new BadRequestException('Este numero ya existe');
      }
      throw new BadRequestException('Este cliente ya existe');
    }

    const customer = this.customerRepository.create(createCustomerDto);
    const saved = await this.customerRepository.save(customer);
    this.notificationsGateway.sendNotification('Nuevo cliente creado');
    return saved;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, updateCustomerDto);
    const saved = await this.customerRepository.save(customer);
    this.notificationsGateway.sendNotification('Cliente actualizado');
    return saved;
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
    this.notificationsGateway.sendNotification('Cliente eliminado');
  }
}
