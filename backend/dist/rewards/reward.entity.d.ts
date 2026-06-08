import { Business } from '../businesses/business.entity';
export declare class Reward {
    id: number;
    name: string;
    description: string;
    validUntil: string;
    pointsRequired: number;
    isActive: boolean;
    createdAt: string;
    business: Business;
}
