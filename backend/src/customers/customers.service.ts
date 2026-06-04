import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { User } from '../auth/user.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

/** Shape that the frontend and the old Customer entity expect */
export interface CustomerResponse {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  business: string | null;
  createdAt: Date;
}

/** Map a User record (role=client) to the legacy Customer shape */
function mapUserToCustomer(user: User): CustomerResponse {
  return {
    id: user.id,
    name: user.fullName,
    email: user.email ?? null,
    phone: user.phone ?? null,
    business: user.customerBusiness ?? null,
    createdAt: user.createdAt,
  };
}

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(): Promise<CustomerResponse[]> {
    const users = await this.userRepository.find({
      where: { role: 'client' },
      order: { createdAt: 'DESC' },
    });
    return users.map(mapUserToCustomer);
  }

  async findOne(id: number): Promise<CustomerResponse> {
    const user = await this.userRepository.findOne({
      where: { id, role: 'client' },
    });
    if (!user) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return mapUserToCustomer(user);
  }

  async create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponse> {
    const { name, email, phone, business } = createCustomerDto;

    // Validate phone format if provided
    if (phone) {
      const phoneStr = String(phone).trim();
      const digits = phoneStr.replace(/\D/g, '');
      if (digits.length !== 11) {
        throw new BadRequestException('El numero tiene que tener 9 digitos');
      }
      if (!/^\+\d{2} \d{3} \d{3} \d{3}$/.test(phoneStr)) {
        throw new BadRequestException('El formato del numero esta mal');
      }
    }

    // Check for duplicate name, email (among clients), or phone (among clients)
    const existingClients = await this.userRepository.find({ where: { role: 'client' } });

    const isDuplicate = existingClients.some(c =>
      c.fullName.toLowerCase() === name.toLowerCase() ||
      (c.email && email && c.email.toLowerCase() === email.toLowerCase()) ||
      (c.phone && phone && c.phone === phone),
    );

    if (isDuplicate) {
      const duplicatePhone = existingClients.some(
        c => c.phone && phone && c.phone === phone,
      );
      if (duplicatePhone) {
        throw new BadRequestException('Este numero ya existe');
      }
      throw new BadRequestException('Este cliente ya existe');
    }

    // Create a User record that represents a CRM-only client (no login credentials)
    const newUser = new User();
    newUser.fullName = name;
    if (email) newUser.email = email;
    if (phone) newUser.phone = phone;
    if (business) newUser.customerBusiness = business;
    newUser.role = 'client';
    newUser.isConfirmed = false; // Not a login account
    // username and passwordHash intentionally left null/undefined

    const saved = await this.userRepository.save(newUser);
    this.notificationsGateway.sendNotification('Nuevo cliente creado');
    return mapUserToCustomer(saved);
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponse> {
    const user = await this.userRepository.findOne({ where: { id, role: 'client' } });
    if (!user) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    // Map DTO fields to User columns
    if (updateCustomerDto.name !== undefined) user.fullName = updateCustomerDto.name;
    if (updateCustomerDto.email !== undefined) user.email = updateCustomerDto.email ?? null;
    if (updateCustomerDto.phone !== undefined) user.phone = updateCustomerDto.phone ?? null;
    if (updateCustomerDto.business !== undefined) user.customerBusiness = updateCustomerDto.business ?? null;

    const saved = await this.userRepository.save(user);
    this.notificationsGateway.sendNotification('Cliente actualizado');
    return mapUserToCustomer(saved);
  }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id, role: 'client' } });
    if (!user) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    await this.userRepository.remove(user);
    this.notificationsGateway.sendNotification('Cliente eliminado');
  }
}

