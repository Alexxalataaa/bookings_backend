import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';
export declare class Service {
    id: number;
    name: string;
    description: string;
    price: number;
    duration: number;
    business: Business;
    appointments: Appointment[];
}
