import { Repository } from 'typeorm';
import { BusinessesService } from '../businesses/businesses.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Reward } from './reward.entity';
export declare class RewardsService {
    private readonly rewardRepository;
    private readonly businessesService;
    constructor(rewardRepository: Repository<Reward>, businessesService: BusinessesService);
    findAll(businessId?: number): Promise<Reward[]>;
    findOne(id: number): Promise<Reward>;
    create(data: CreateRewardDto, ownerId: number): Promise<Reward>;
    update(id: number, data: UpdateRewardDto, ownerId: number): Promise<Reward>;
    remove(id: number, ownerId: number): Promise<void>;
}
