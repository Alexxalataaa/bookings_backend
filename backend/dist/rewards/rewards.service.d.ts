import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';
import { ClientProgress } from './client-progress.entity';
export declare class RewardsService {
    private rewardsRepo;
    private progressRepo;
    private businessRepo;
    private userRepo;
    constructor(rewardsRepo: Repository<Reward>, progressRepo: Repository<ClientProgress>, businessRepo: Repository<Business>, userRepo: Repository<User>);
    findAll(businessId?: number): Promise<Reward[]>;
    findOne(id: number): Promise<Reward>;
    create(data: Partial<Reward> & {
        businessId: number;
        winnerId?: number;
    }): Promise<Reward>;
    update(id: number, data: Partial<Reward> & {
        winnerId?: number | null;
    }): Promise<Reward>;
    delete(id: number): Promise<void>;
    getClientProgress(businessId: number, userId: number): Promise<{
        points: number;
    }>;
    getAllClientProgress(userId: number): Promise<ClientProgress[]>;
    addPoints(businessId: number, userId: number, pointsToAdd: number): Promise<ClientProgress>;
    getUnlockedRewards(businessId: number, userId: number): Promise<Reward[]>;
}
