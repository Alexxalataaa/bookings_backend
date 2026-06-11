import { User } from '../auth/user.entity';
import { Business } from '../businesses/business.entity';
import { Service } from '../services/service.entity';
import { Spot } from '../spots/spot.entity';
export declare enum AppointmentStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PAID = "paid",
    CANCELLED = "cancelled"
}
export declare class Appointment {
    id: number;
    date: string;
    time: string;
    status: AppointmentStatus;
    customerId: number;
    businessId: number;
    serviceName: string;
    user: User;
    business: Business;
    service: Service;
    spotId: number;
    spot: Spot;
    pointsAwarded: boolean;
}
