import { Repository } from 'typeorm';
import { SystemLog } from './entities/log.entity';
import { User } from '../auth/user.entity';
import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';
export declare class LogsController {
    private readonly logRepo;
    private readonly userRepo;
    private readonly businessRepo;
    private readonly appointmentRepo;
    constructor(logRepo: Repository<SystemLog>, userRepo: Repository<User>, businessRepo: Repository<Business>, appointmentRepo: Repository<Appointment>);
    findAll(limit?: string): Promise<SystemLog[]>;
    metrics(): Promise<{
        totalUsers: number;
        totalCustomers: number;
        totalBusinesses: number;
        totalAppointments: number;
    }>;
}
