import { Repository } from 'typeorm';
import { Appointment } from './appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { Business } from '../businesses/business.entity';
export declare class AppointmentsService {
    private readonly appointmentsRepository;
    private readonly businessRepository;
    private readonly notificationsGateway;
    constructor(appointmentsRepository: Repository<Appointment>, businessRepository: Repository<Business>, notificationsGateway: NotificationsGateway);
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
