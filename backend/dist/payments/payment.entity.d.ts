import { Business } from '../businesses/business.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid"
}
export declare class Payment {
    id: number;
    clientName: string;
    businessName: string;
    amount: number;
    method: string;
    date: string;
    status: PaymentStatus;
    createdAt: Date;
    business: Business;
}
