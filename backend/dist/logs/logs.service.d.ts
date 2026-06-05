import { Repository } from 'typeorm';
import { SystemLog } from './entities/log.entity';
import { User } from '../auth/user.entity';
import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';
export declare class LogsService {
    private logRepository;
    private userRepository;
    private businessRepository;
    private appointmentRepository;
    constructor(logRepository: Repository<SystemLog>, userRepository: Repository<User>, businessRepository: Repository<Business>, appointmentRepository: Repository<Appointment>);
    logAction(action: string, entityName?: string, entityId?: string, userId?: number, details?: string): Promise<SystemLog>;
    getLogs(limit?: number): Promise<SystemLog[]>;
    getMetrics(): Promise<{
        totalUsers: number;
        totalBusinesses: number;
        totalCustomers: number;
        totalAppointments: number;
        appointmentsByStatus: {
            pending: number;
            confirmed: number;
            paid: number;
        };
    }>;
}
