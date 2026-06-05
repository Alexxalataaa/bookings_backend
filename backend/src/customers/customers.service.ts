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

import { Brackets, In } from 'typeorm';
import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findAll(userReq?: { userId: number; role: string; username: string }): Promise<CustomerResponse[]> {
    if (userReq && userReq.role === 'business') {
      const businesses = await this.businessRepository.find({
        where: { owner: { id: userReq.userId } }
      });
      if (businesses.length === 0) {
        return [];
      }
      const businessIds = businesses.map(b => b.id);
      const businessNames = businesses.map(b => b.name);

      const users = await this.userRepository.createQueryBuilder('user')
        .leftJoin('user.appointments', 'appointment')
        .where('user.role = :role', { role: 'client' })
        .andWhere(
          new Brackets(qb => {
            qb.where('appointment.businessId IN (:...businessIds)', { businessIds })
              .orWhere('user.customerBusiness IN (:...businessNames)', { businessNames });
          })
        )
        .orderBy('user.createdAt', 'DESC')
        .getMany();

      // De-duplicate users manually to be safe
      const seen = new Set<number>();
      const uniqueUsers = users.filter(u => {
        if (seen.has(u.id)) return false;
        seen.add(u.id);
        return true;
      });

      return uniqueUsers.map(mapUserToCustomer);
    }

    // Superadmin or fallback - return all clients that have at least one appointment
    const users = await this.userRepository.createQueryBuilder('user')
      .innerJoin('user.appointments', 'appointment')
      .where('user.role = :role', { role: 'client' })
      .orderBy('user.createdAt', 'DESC')
      .getMany();

    const seen = new Set<number>();
    const uniqueUsers = users.filter(u => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });

    return uniqueUsers.map(mapUserToCustomer);
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

  async remove(id: number, userReq?: { userId: number; role: string }): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id, role: 'client' } });
    if (!user) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    if (userReq && userReq.role === 'business') {
      // Find businesses owned by this owner
      const businesses = await this.businessRepository.find({
        where: { owner: { id: userReq.userId } }
      });
      if (businesses.length > 0) {
        const businessIds = businesses.map(b => b.id);
        // Delete appointments for this customer in this owner's businesses
        await this.appointmentRepository.delete({
          customerId: id,
          businessId: In(businessIds),
        });
      }
    } else {
      // Superadmin - delete all appointments for this customer
      await this.appointmentRepository.delete({ customerId: id });
    }

    // Check if the customer has any appointments remaining in the entire system
    const remainingCount = await this.appointmentRepository.count({
      where: { customerId: id }
    });

    // If no appointments remain, or if it is deleted by superadmin, remove user
    if (remainingCount === 0 || !userReq || userReq.role === 'superadmin') {
      await this.userRepository.remove(user);
    }

    this.notificationsGateway.sendNotification('Cliente eliminado');
  }
}

