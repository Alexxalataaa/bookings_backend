import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';
export declare class Reward {
    id: number;
    name: string;
    conditions?: string;
    description: string;
    validUntil: string;
    pointsRequired: number;
    isActive: boolean;
    createdAt: Date;
    business: Business;
    winner: User;
}
