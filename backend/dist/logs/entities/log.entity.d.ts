import { User } from '../../auth/user.entity';
export declare class SystemLog {
    id: number;
    action: string;
    entityName: string;
    entityId: string;
    user: User;
    userId: number;
    details: string;
    createdAt: string;
}
