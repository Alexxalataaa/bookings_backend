import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';
export declare class ClientProgress {
    id: number;
    points: number;
    user: User;
    business: Business;
    updatedAt: string;
}
