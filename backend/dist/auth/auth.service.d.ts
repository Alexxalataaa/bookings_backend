import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Business } from '../businesses/business.entity';
import { Service } from '../services/service.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Payment } from '../payments/payment.entity';
export declare class AuthService implements OnModuleInit {
    private readonly userRepository;
    private readonly businessRepository;
    private readonly serviceRepository;
    private readonly appointmentRepository;
    private readonly paymentRepository;
    private readonly tokenTtlMs;
    private readonly tokens;
    private readonly tempRegisterCodes;
    constructor(userRepository: Repository<User>, businessRepository: Repository<Business>, serviceRepository: Repository<Service>, appointmentRepository: Repository<Appointment>, paymentRepository: Repository<Payment>);
    onModuleInit(): Promise<void>;
    private send2faEmail;
    login(username: string, password: string): Promise<{
        token: string;
        user: {
            id: number;
            username: string;
            fullName: string;
            email: string;
            role: string;
        };
    }>;
    verifyRegister(tempToken: string, code: string): Promise<{
        message: string;
    }>;
    register(fullName: string, email: string, username: string, password: string, role?: string): Promise<{
        require2fa: boolean;
        tempToken: string;
        message: string;
    }>;
    validateToken(token: string): {
        userId: number;
        username: string;
        role: string;
    } | null;
    getUserById(id: number): Promise<User>;
    updateProfile(userId: number, username?: string, password?: string): Promise<{
        id: number;
        username: string;
        fullName: string;
        email: string;
        role: string;
    }>;
}
