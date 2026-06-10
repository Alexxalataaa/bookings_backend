import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardsService } from './rewards.service';
export declare class RewardsController {
    private readonly rewardsService;
    constructor(rewardsService: RewardsService);
    findAll(businessId?: string): Promise<import("./reward.entity").Reward[]>;
    findOne(id: number): Promise<import("./reward.entity").Reward>;
    create(body: CreateRewardDto, req: any): Promise<import("./reward.entity").Reward>;
    update(id: number, body: UpdateRewardDto, req: any): Promise<import("./reward.entity").Reward>;
    remove(id: number, req: any): Promise<void>;
}
