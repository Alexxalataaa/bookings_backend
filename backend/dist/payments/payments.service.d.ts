import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export declare class PaymentsService {
    private readonly paymentRepository;
    private readonly notificationsGateway;
    constructor(paymentRepository: Repository<Payment>, notificationsGateway: NotificationsGateway);
    findAll(user: {
        userId: number;
        role: string;
        username: string;
    }, range?: string, businessId?: number): Promise<Payment[]>;
    findOne(id: number): Promise<Payment>;
    create(createPaymentDto: CreatePaymentDto): Promise<Payment>;
    update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment>;
    remove(id: number): Promise<void>;
}
