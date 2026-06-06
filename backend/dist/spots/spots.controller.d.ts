import { SpotsService } from './spots.service';
import { Repository } from 'typeorm';
import { Business } from '../businesses/business.entity';
export declare class SpotsController {
    private readonly spotsService;
    private readonly businessRepository;
    constructor(spotsService: SpotsService, businessRepository: Repository<Business>);
    findAll(businessId: number, date?: string, time?: string): Promise<(import("./spot.entity").Spot & {
        available: boolean;
    })[]>;
    create(body: any, req: any): Promise<import("./spot.entity").Spot>;
    update(id: number, body: any, req: any): Promise<import("./spot.entity").Spot>;
    remove(id: number, req: any): Promise<{
        success: boolean;
    }>;
    private getOwnerBusinessIds;
}
