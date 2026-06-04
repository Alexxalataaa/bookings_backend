import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly notificationsGateway: NotificationsGateway,
  ) { }

  async findAll(
    user: { userId: number; role: string; username: string },
    range?: string,
    businessId?: number,
  ): Promise<Payment[]> {
    const isSuperadmin = user.username === 'admin' || user.role === 'superadmin';

    const query = this.paymentRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.business', 'business')
      .orderBy('payment.date', 'DESC');

    if (isSuperadmin) {
      if (businessId) {
        query.andWhere('payment.businessId = :businessId', { businessId });
      }
    } else if (user.role === 'business') {
      query.leftJoin('business.owner', 'owner')
        .andWhere('owner.id = :ownerId', { ownerId: user.userId });

      if (businessId) {
        query.andWhere('payment.businessId = :businessId', { businessId });
      }
    } else {
      // Client
      query.andWhere('payment.clientName = :fullName', { fullName: user.username });
    }

    if (range) {
      const now = new Date();
      let start: string | undefined = undefined;
      let end: string | undefined = undefined;

      if (range === 'hoy') {
        const d = new Date(now);
        start = d.toISOString().split('T')[0];
        end = d.toISOString().split('T')[0];
      } else if (range === 'semana') {
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        start = startOfWeek.toISOString().split('T')[0];

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        end = endOfWeek.toISOString().split('T')[0];
      } else if (range === 'mes') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        start = startOfMonth.toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        end = endOfMonth.toISOString().split('T')[0];
      } else if (range === 'año' || range === 'anio') {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        start = startOfYear.toISOString().split('T')[0];
        const endOfYear = new Date(now.getFullYear(), 11, 31);
        end = endOfYear.toISOString().split('T')[0];
      }

      if (start && end) {
        query.andWhere('payment.date BETWEEN :start AND :end', { start, end });
      }
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['business'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create({
      clientName: createPaymentDto.clientName,
      businessName: createPaymentDto.businessName,
      amount: createPaymentDto.amount,
      method: createPaymentDto.method,
      date: createPaymentDto.date,
      status: createPaymentDto.status as any,
      business: createPaymentDto.businessId ? { id: createPaymentDto.businessId } as any : null,
    });
    const saved = await this.paymentRepository.save(payment);
    this.notificationsGateway.sendNotification('Nuevo pago creado');
    return saved;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    const saved = await this.paymentRepository.save(payment);
    this.notificationsGateway.sendNotification('Pago actualizado');
    return saved;
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
    this.notificationsGateway.sendNotification('Pago eliminado');
  }
}
