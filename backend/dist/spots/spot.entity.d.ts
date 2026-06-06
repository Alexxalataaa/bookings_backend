import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';
export declare class Spot {
    id: number;
    name: string;
    label: string;
    posX: number;
    posY: number;
    color: string;
    businessId: number;
    business: Business;
    appointments: Appointment[];
}
