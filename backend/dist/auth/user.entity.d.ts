import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Reward } from '../rewards/reward.entity';
export declare function hashPassword(password: string): string;
export declare class User {
    id: number;
    fullName: string;
    email: string;
    username: string;
    passwordHash: string;
    isConfirmed: boolean;
    role: string;
    phone: string;
    customerBusiness: string;
    createdAt: Date;
    businesses: Business[];
    appointments: Appointment[];
    rewards: Reward[];
}
