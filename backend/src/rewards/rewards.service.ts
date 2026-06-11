import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private rewardsRepo: Repository<Reward>,
    @InjectRepository(Business)
    private businessRepo: Repository<Business>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(businessId?: number): Promise<Reward[]> {
    if (businessId) {
      return this.rewardsRepo.find({
        where: { business: { id: businessId } },
        relations: ['business', 'winner'],
        order: { createdAt: 'DESC' },
      });
    }
    return this.rewardsRepo.find({ relations: ['business', 'winner'], order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Reward> {
    const reward = await this.rewardsRepo.findOne({ where: { id }, relations: ['business', 'winner'] });
    if (!reward) throw new NotFoundException('Reward not found');
    return reward;
  }

  async create(data: Partial<Reward> & { businessId: number; winnerId?: number }): Promise<Reward> {
    const business = await this.businessRepo.findOne({ where: { id: data.businessId } });
    if (!business) throw new NotFoundException('Business not found');

    const { winnerId, ...payload } = data;
    const reward = this.rewardsRepo.create({
      ...payload,
      business,
    });

    if (winnerId !== undefined && winnerId !== null) {
      const winner = await this.userRepo.findOne({ where: { id: winnerId } });
      if (!winner) throw new NotFoundException('Winner user not found');
      reward.winner = winner;
    }

    return this.rewardsRepo.save(reward);
  }

  async update(id: number, data: Partial<Reward> & { winnerId?: number | null }): Promise<Reward> {
    const reward = await this.findOne(id);
    const { winnerId, ...payload } = data as any;

    if ('winnerId' in data) {
      if (winnerId === null) {
        reward.winner = null;
      } else if (winnerId !== undefined) {
        const winner = await this.userRepo.findOne({ where: { id: winnerId } });
        if (!winner) throw new NotFoundException('Winner user not found');
        reward.winner = winner;
      }
    }

    Object.assign(reward, payload);
    return this.rewardsRepo.save(reward);
  }

  async delete(id: number): Promise<void> {
    const result = await this.rewardsRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Reward not found');
  }
}
