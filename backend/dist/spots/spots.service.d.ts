import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Spot } from './spot.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Business } from '../businesses/business.entity';
export declare class SpotsService implements OnModuleInit {
    private readonly spotRepository;
    private readonly appointmentRepository;
    private readonly businessRepository;
    private readonly logger;
    constructor(spotRepository: Repository<Spot>, appointmentRepository: Repository<Appointment>, businessRepository: Repository<Business>);
    onModuleInit(): Promise<void>;
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
