import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';
export declare class Reward {
    id: number;
    name: string;
    description: string;
    validUntil: string;
    pointsRequired: number;
    isActive: boolean;
    visibility: string;
    createdAt: string;
    winner: User | null;
    business: Business;
}
