import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { Business } from '../businesses/business.entity';
export declare class RewardsService {
    private rewardsRepo;
    private businessRepo;
    constructor(rewardsRepo: Repository<Reward>, businessRepo: Repository<Business>);
    findAll(businessId?: number): Promise<Reward[]>;
    findOne(id: number): Promise<Reward>;
    create(data: Partial<Reward> & {
        businessId: number;
    }): Promise<Reward>;
    update(id: number, data: Partial<Reward>): Promise<Reward>;
    delete(id: number): Promise<void>;
}
