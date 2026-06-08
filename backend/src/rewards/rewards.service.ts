import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { Business } from '../businesses/business.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private rewardsRepo: Repository<Reward>,
    @InjectRepository(Business)
    private businessRepo: Repository<Business>,
  ) {}

  async findAll(businessId?: number): Promise<Reward[]> {
    if (businessId) {
      return this.rewardsRepo.find({
        where: { business: { id: businessId } },
        relations: ['business'],
        order: { createdAt: 'DESC' },
      });
    }
    return this.rewardsRepo.find({ relations: ['business'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Reward> {
    const reward = await this.rewardsRepo.findOne({ where: { id }, relations: ['business'] });
    if (!reward) throw new NotFoundException('Reward not found');
    return reward;
  }

  async create(data: Partial<Reward> & { businessId: number }): Promise<Reward> {
    const business = await this.businessRepo.findOne({ where: { id: data.businessId } });
    if (!business) throw new NotFoundException('Business not found');

    const reward = this.rewardsRepo.create({
      ...data,
      business,
    });
    return this.rewardsRepo.save(reward);
  }

  async update(id: number, data: Partial<Reward>): Promise<Reward> {
    const reward = await this.findOne(id);
    Object.assign(reward, data);
    return this.rewardsRepo.save(reward);
  }

  async delete(id: number): Promise<void> {
    const result = await this.rewardsRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Reward not found');
  }
}
