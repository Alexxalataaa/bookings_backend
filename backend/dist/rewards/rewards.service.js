"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const businesses_service_1 = require("../businesses/businesses.service");
const reward_entity_1 = require("./reward.entity");
let RewardsService = class RewardsService {
    rewardRepository;
    businessesService;
    constructor(rewardRepository, businessesService) {
        this.rewardRepository = rewardRepository;
        this.businessesService = businessesService;
    }
    async findAll(businessId) {
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
    async findOne(id) {
        const reward = await this.rewardRepository.findOne({
            where: { id },
            relations: ['business', 'winner'],
        });
        if (!reward) {
            throw new common_1.NotFoundException('Premio no encontrado');
        }
        return reward;
    }
    async create(data, ownerId) {
        const business = await this.businessesService.findOne(data.businessId);
        if (business.owner?.id !== ownerId) {
            throw new common_1.UnauthorizedException('No tienes permisos para gestionar este negocio');
        }
        const reward = this.rewardRepository.create({
            name: data.name,
            description: data.description,
            validUntil: data.validUntil,
            pointsRequired: data.pointsRequired,
            isActive: data.isActive ?? true,
            business,
            winner: data.winnerId ? { id: data.winnerId } : null,
        });
        return this.rewardRepository.save(reward);
    }
    async update(id, data, ownerId) {
        const reward = await this.rewardRepository.findOne({
            where: { id },
            relations: ['business', 'business.owner', 'winner'],
        });
        if (!reward) {
            throw new common_1.NotFoundException('Premio no encontrado');
        }
        if (reward.business.owner?.id !== ownerId) {
            throw new common_1.UnauthorizedException('No tienes permisos para editar este premio');
        }
        reward.name = data.name ?? reward.name;
        reward.description = data.description ?? reward.description;
        reward.validUntil = data.validUntil ?? reward.validUntil;
        reward.pointsRequired = data.pointsRequired ?? reward.pointsRequired;
        reward.isActive = data.isActive ?? reward.isActive;
        if (data.winnerId !== undefined) {
            reward.winner = data.winnerId ? { id: data.winnerId } : null;
        }
        return this.rewardRepository.save(reward);
    }
    async remove(id, ownerId) {
        const reward = await this.rewardRepository.findOne({
            where: { id },
            relations: ['business', 'business.owner'],
        });
        if (!reward) {
            throw new common_1.NotFoundException('Premio no encontrado');
        }
        if (reward.business.owner?.id !== ownerId) {
            throw new common_1.UnauthorizedException('No tienes permisos para eliminar este premio');
        }
        await this.rewardRepository.remove(reward);
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reward_entity_1.Reward)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        businesses_service_1.BusinessesService])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map