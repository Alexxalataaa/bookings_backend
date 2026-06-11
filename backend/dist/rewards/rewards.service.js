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
const reward_entity_1 = require("./reward.entity");
const business_entity_1 = require("../businesses/business.entity");
const user_entity_1 = require("../auth/user.entity");
const client_progress_entity_1 = require("./client-progress.entity");
let RewardsService = class RewardsService {
    rewardsRepo;
    progressRepo;
    businessRepo;
    userRepo;
    constructor(rewardsRepo, progressRepo, businessRepo, userRepo) {
        this.rewardsRepo = rewardsRepo;
        this.progressRepo = progressRepo;
        this.businessRepo = businessRepo;
        this.userRepo = userRepo;
    }
    async findAll(businessId) {
        if (businessId) {
            return this.rewardsRepo.find({
                where: { business: { id: businessId } },
                relations: ['business', 'winner'],
                order: { createdAt: 'DESC' },
            });
        }
        return this.rewardsRepo.find({ relations: ['business', 'winner'], order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const reward = await this.rewardsRepo.findOne({ where: { id }, relations: ['business', 'winner'] });
        if (!reward)
            throw new common_1.NotFoundException('Reward not found');
        return reward;
    }
    async create(data) {
        const business = await this.businessRepo.findOne({ where: { id: data.businessId } });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        const { winnerId, ...payload } = data;
        const reward = this.rewardsRepo.create({
            ...payload,
            business,
        });
        if (winnerId !== undefined && winnerId !== null) {
            const winner = await this.userRepo.findOne({ where: { id: winnerId } });
            if (!winner)
                throw new common_1.NotFoundException('Winner user not found');
            reward.winner = winner;
        }
        return this.rewardsRepo.save(reward);
    }
    async update(id, data) {
        const reward = await this.findOne(id);
        const { winnerId, ...payload } = data;
        if ('winnerId' in data) {
            if (winnerId === null) {
                reward.winner = null;
            }
            else if (winnerId !== undefined) {
                const winner = await this.userRepo.findOne({ where: { id: winnerId } });
                if (!winner)
                    throw new common_1.NotFoundException('Winner user not found');
                reward.winner = winner;
            }
        }
        Object.assign(reward, payload);
        return this.rewardsRepo.save(reward);
    }
    async delete(id) {
        const result = await this.rewardsRepo.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Reward not found');
    }
    async getClientProgress(businessId, userId) {
        const progress = await this.progressRepo.findOne({
            where: { business: { id: businessId }, user: { id: userId } },
        });
        return { points: progress ? progress.points : 0 };
    }
    async getAllClientProgress(userId) {
        return this.progressRepo.find({
            where: { user: { id: userId } },
            relations: ['business'],
        });
    }
    async addPoints(businessId, userId, pointsToAdd) {
        let progress = await this.progressRepo.findOne({
            where: { business: { id: businessId }, user: { id: userId } },
        });
        if (!progress) {
            progress = this.progressRepo.create({
                business: { id: businessId },
                user: { id: userId },
                points: pointsToAdd,
            });
        }
        else {
            progress.points += pointsToAdd;
            progress.updatedAt = new Date().toISOString();
        }
        return this.progressRepo.save(progress);
    }
    async getUnlockedRewards(businessId, userId) {
        const progress = await this.getClientProgress(businessId, userId);
        if (progress.points === 0)
            return [];
        const activeRewards = await this.rewardsRepo.find({
            where: { business: { id: businessId }, isActive: true },
        });
        return activeRewards.filter(r => r.pointsRequired && progress.points >= r.pointsRequired);
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reward_entity_1.Reward)),
    __param(1, (0, typeorm_1.InjectRepository)(client_progress_entity_1.ClientProgress)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map