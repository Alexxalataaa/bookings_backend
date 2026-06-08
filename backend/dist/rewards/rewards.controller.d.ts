import { RewardsService } from './rewards.service';
import { Reward } from './reward.entity';
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    findAll(businessId?: string): Promise<Reward[]>;
    findOne(id: number): Promise<Reward>;
    create(data: Partial<Reward> & {
        businessId: number;
    }): Promise<Reward>;
    update(id: number, data: Partial<Reward>): Promise<Reward>;
    delete(id: number): Promise<void>;
}
