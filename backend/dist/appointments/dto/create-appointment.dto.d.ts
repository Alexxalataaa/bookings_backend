import { AppointmentStatus } from '../appointment.entity';
export declare class CreateAppointmentDto {
    date: string;
    time: string;
    status: AppointmentStatus;
    customerId?: number;
    businessId: number;
    serviceName: string;
    serviceId?: number;
    spotId?: number;
}
