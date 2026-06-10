import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessesService } from '../businesses/businesses.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Reward } from './reward.entity';

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    private readonly businessesService: BusinessesService,
  ) {}

  async findAll(businessId?: number): Promise<Reward[]> {
    const query = this.rewardRepository
      .createQueryBuilder('reward')
      .leftJoinAndSelect('reward.business', 'business')
      .leftJoinAndSelect('reward.winner', 'winner')
      .orderBy('reward.createdAt', 'DESC');

    if (businessId) {
      query.where('reward.businessId = :businessId', { businessId });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({
      where: { id },
      relations: ['business', 'winner'],
    });

    if (!reward) {
      throw new NotFoundException('Premio no encontrado');
    }

    return reward;
  }

  async create(data: CreateRewardDto, ownerId: number): Promise<Reward> {
    const business = await this.businessesService.findOne(data.businessId);
    if (business.owner?.id !== ownerId) {
      throw new UnauthorizedException('No tienes permisos para gestionar este negocio');
    }

    const reward = this.rewardRepository.create({
      name: data.name,
      description: data.description,
      validUntil: data.validUntil,
      pointsRequired: data.pointsRequired,
      isActive: data.isActive ?? true,
      business,
      winner: data.winnerId ? ({ id: data.winnerId } as any) : null,
    });

    return this.rewardRepository.save(reward);
  }

  async update(id: number, data: UpdateRewardDto, ownerId: number): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({
      where: { id },
      relations: ['business', 'business.owner', 'winner'],
    });

    if (!reward) {
      throw new NotFoundException('Premio no encontrado');
    }

    if (reward.business.owner?.id !== ownerId) {
      throw new UnauthorizedException('No tienes permisos para editar este premio');
    }

    reward.name = data.name ?? reward.name;
    reward.description = data.description ?? reward.description;
    reward.validUntil = data.validUntil ?? reward.validUntil;
    reward.pointsRequired = data.pointsRequired ?? reward.pointsRequired;
    reward.isActive = data.isActive ?? reward.isActive;

    if (data.winnerId !== undefined) {
      reward.winner = data.winnerId ? ({ id: data.winnerId } as any) : null;
    }

    return this.rewardRepository.save(reward);
  }

  async remove(id: number, ownerId: number): Promise<void> {
    const reward = await this.rewardRepository.findOne({
      where: { id },
      relations: ['business', 'business.owner'],
    });

    if (!reward) {
      throw new NotFoundException('Premio no encontrado');
    }

    if (reward.business.owner?.id !== ownerId) {
      throw new UnauthorizedException('No tienes permisos para eliminar este premio');
    }

    await this.rewardRepository.remove(reward);
  }
}
