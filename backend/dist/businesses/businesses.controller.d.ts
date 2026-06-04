import { BusinessesService } from './businesses.service';
export declare class BusinessesController {
    private readonly businessesService;
    constructor(businessesService: BusinessesService);
    findAll(): Promise<import("./business.entity").Business[]>;
    findAllAll(): Promise<import("./business.entity").Business[]>;
    findMy(req: any): Promise<import("./business.entity").Business[]>;
    findOne(idOrSlug: string): Promise<import("./business.entity").Business>;
    create(body: any, req: any): Promise<import("./business.entity").Business[]>;
    update(id: string, body: any, req: any): Promise<import("./business.entity").Business>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
