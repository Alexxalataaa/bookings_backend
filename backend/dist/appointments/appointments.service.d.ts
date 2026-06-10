import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';
import { Service } from '../services/service.entity';
import { Spot } from '../spots/spot.entity';
export declare class AppointmentsService {
    private readonly appointmentsRepository;
    private readonly businessRepository;
    private readonly userRepository;
    private readonly serviceRepository;
    private readonly spotRepository;
    private readonly notificationsGateway;
    constructor(appointmentsRepository: Repository<Appointment>, businessRepository: Repository<Business>, userRepository: Repository<User>, serviceRepository: Repository<Service>, spotRepository: Repository<Spot>, notificationsGateway: NotificationsGateway);
    findAll(user: {
        userId: number;
        role: string;
        username: string;
    }, businessId?: number): Promise<Appointment[]>;
    findOne(id: number): Promise<Appointment>;
    create(createAppointmentDto: CreateAppointmentDto & {
        userId?: number;
    }): Promise<Appointment>;
    update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
