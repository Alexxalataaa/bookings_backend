import { ServicesService } from './services.service';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findByBusiness(businessId: string): Promise<import("./service.entity").Service[]>;
    findOne(id: string): Promise<import("./service.entity").Service>;
    create(body: any, req: any): Promise<import("./service.entity").Service>;
    update(id: string, body: any, req: any): Promise<import("./service.entity").Service>;
    delete(id: string, req: any): Promise<{
        success: boolean;
    }>;
}
