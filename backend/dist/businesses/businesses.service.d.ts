import { Repository } from 'typeorm';
import { Business } from './business.entity';
export declare class BusinessesService {
    private readonly businessRepository;
    constructor(businessRepository: Repository<Business>);
    findAll(): Promise<Business[]>;
    findAllForSuperadmin(): Promise<Business[]>;
    findByOwner(ownerId: number): Promise<Business[]>;
    findOne(idOrSlug: string | number): Promise<Business>;
    create(data: any, owner: any): Promise<Business[]>;
    update(id: number, data: any, ownerId: number, isSuperadmin?: boolean): Promise<Business>;
    delete(id: number, ownerId: number, isSuperadmin?: boolean): Promise<{
        success: boolean;
    }>;
}
