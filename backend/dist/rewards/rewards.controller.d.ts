import { RewardsService } from './rewards.service';
import { Reward } from './reward.entity';
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    findAll(businessId?: string): Promise<Reward[]>;
    getMyProgress(userId: number): Promise<import("./client-progress.entity").ClientProgress[]>;
    getProgress(businessId: number, userId: number): Promise<{
        points: number;
    }>;
    getUnlocked(businessId: number, userId: number): Promise<Reward[]>;
    findOne(id: number): Promise<Reward>;
    create(data: Partial<Reward> & {
        businessId: number;
        winnerId?: number;
    }): Promise<Reward>;
    update(id: number, data: Partial<Reward> & {
        winnerId?: number | null;
    }): Promise<Reward>;
    delete(id: number): Promise<void>;
}
