import { Repository } from 'typeorm';
import { User } from '../auth/user.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
export interface CustomerResponse {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    business: string | null;
    createdAt: Date;
}
import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';
export declare class CustomersService {
    private readonly userRepository;
    private readonly businessRepository;
    private readonly appointmentRepository;
    private readonly notificationsGateway;
    constructor(userRepository: Repository<User>, businessRepository: Repository<Business>, appointmentRepository: Repository<Appointment>, notificationsGateway: NotificationsGateway);
    findAll(userReq?: {
        userId: number;
        role: string;
        username: string;
    }): Promise<CustomerResponse[]>;
    findOne(id: number): Promise<CustomerResponse>;
    create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponse>;
    update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponse>;
    remove(id: number, userReq?: {
        userId: number;
        role: string;
    }): Promise<void>;
}
