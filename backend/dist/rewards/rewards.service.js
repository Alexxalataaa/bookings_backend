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
let RewardsService = class RewardsService {
    rewardsRepo;
    businessRepo;
    constructor(rewardsRepo, businessRepo) {
        this.rewardsRepo = rewardsRepo;
        this.businessRepo = businessRepo;
    }
    async findAll(businessId) {
        if (businessId) {
            return this.rewardsRepo.find({
                where: { business: { id: businessId } },
                relations: ['business'],
                order: { createdAt: 'DESC' },
            });
        }
        return this.rewardsRepo.find({ relations: ['business'], order: { createdAt: 'DESC' } });
    }
    async findOne(id) {
        const reward = await this.rewardsRepo.findOne({ where: { id }, relations: ['business'] });
        if (!reward)
            throw new common_1.NotFoundException('Reward not found');
        return reward;
    }
    async create(data) {
        const business = await this.businessRepo.findOne({ where: { id: data.businessId } });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        const reward = this.rewardsRepo.create({
            ...data,
            business,
        });
        return this.rewardsRepo.save(reward);
    }
    async update(id, data) {
        const reward = await this.findOne(id);
        Object.assign(reward, data);
        return this.rewardsRepo.save(reward);
    }
    async delete(id) {
        const result = await this.rewardsRepo.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Reward not found');
    }
};
exports.RewardsService = RewardsService;
exports.RewardsService = RewardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reward_entity_1.Reward)),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], RewardsService);
//# sourceMappingURL=rewards.service.js.map