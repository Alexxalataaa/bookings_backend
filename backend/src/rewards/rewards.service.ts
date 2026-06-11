import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from './reward.entity';
import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';
import { ClientProgress } from './client-progress.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private rewardsRepo: Repository<Reward>,
    @InjectRepository(ClientProgress)
    private progressRepo: Repository<ClientProgress>,
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

  async getClientProgress(businessId: number, userId: number): Promise<{ points: number }> {
    const progress = await this.progressRepo.findOne({
      where: { business: { id: businessId }, user: { id: userId } },
    });
    return { points: progress ? progress.points : 0 };
  }

  async getAllClientProgress(userId: number): Promise<ClientProgress[]> {
    return this.progressRepo.find({
      where: { user: { id: userId } },
      relations: ['business'],
    });
  }

  async addPoints(businessId: number, userId: number, pointsToAdd: number): Promise<ClientProgress> {
    let progress = await this.progressRepo.findOne({
      where: { business: { id: businessId }, user: { id: userId } },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        business: { id: businessId } as any,
        user: { id: userId } as any,
        points: pointsToAdd,
      });
    } else {
      progress.points += pointsToAdd;
      progress.updatedAt = new Date().toISOString();
    }

    return this.progressRepo.save(progress);
  }

  async getUnlockedRewards(businessId: number, userId: number): Promise<Reward[]> {
    const progress = await this.getClientProgress(businessId, userId);
    if (progress.points === 0) return [];

    const activeRewards = await this.rewardsRepo.find({
      where: { business: { id: businessId }, isActive: true },
    });

    return activeRewards.filter(r => r.pointsRequired && progress.points >= r.pointsRequired);
  }
}
