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
export declare class CustomersService {
    private readonly userRepository;
    private readonly notificationsGateway;
    constructor(userRepository: Repository<User>, notificationsGateway: NotificationsGateway);
    findAll(): Promise<CustomerResponse[]>;
    findOne(id: number): Promise<CustomerResponse>;
    create(createCustomerDto: CreateCustomerDto): Promise<CustomerResponse>;
    update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<CustomerResponse>;
    remove(id: number): Promise<void>;
}
