import { Repository } from 'typeorm';
import { Spot } from './spot.entity';
import { Appointment } from '../appointments/appointment.entity';
export declare class SpotsService {
    private readonly spotRepository;
    private readonly appointmentRepository;
    constructor(spotRepository: Repository<Spot>, appointmentRepository: Repository<Appointment>);
    findByBusiness(businessId: number, date?: string, time?: string): Promise<(Spot & {
        available: boolean;
    })[]>;
    isSpotAvailable(spotId: number, date: string, time: string): Promise<boolean>;
    create(data: Partial<Spot>, ownerId: number, ownerBusinessIds: number[]): Promise<Spot>;
    update(id: number, data: Partial<Spot>, ownerBusinessIds: number[]): Promise<Spot>;
    remove(id: number, ownerBusinessIds: number[]): Promise<{
        success: boolean;
    }>;
}
