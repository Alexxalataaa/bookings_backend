import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { BusinessesService } from '../businesses/businesses.service';
export declare class ServicesService {
    private readonly serviceRepository;
    private readonly businessesService;
    constructor(serviceRepository: Repository<Service>, businessesService: BusinessesService);
    findByBusiness(businessId: number): Promise<Service[]>;
    findOne(id: number): Promise<Service>;
    create(data: any, ownerId: number): Promise<Service>;
    update(id: number, data: any, ownerId: number): Promise<Service>;
    delete(id: number, ownerId: number): Promise<{
        success: boolean;
    }>;
}
