import { PaymentStatus } from '../payment.entity';
export declare class CreatePaymentDto {
    clientName: string;
    businessName: string;
    amount: number;
    method: string;
    date: string;
    status?: PaymentStatus;
    businessId?: number;
}
