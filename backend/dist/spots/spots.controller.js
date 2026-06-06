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
exports.SpotsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const spots_service_1 = require("./spots.service");
const auth_guard_1 = require("../auth/auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("../businesses/business.entity");
let SpotsController = class SpotsController {
    spotsService;
    businessRepository;
    constructor(spotsService, businessRepository) {
        this.spotsService = spotsService;
        this.businessRepository = businessRepository;
    }
    async findAll(businessId, date, time) {
        return this.spotsService.findByBusiness(businessId, date, time);
    }
    async create(body, req) {
        const ownerBusinessIds = await this.getOwnerBusinessIds(req.user);
        return this.spotsService.create(body, req.user.userId, ownerBusinessIds);
    }
    async update(id, body, req) {
        const ownerBusinessIds = await this.getOwnerBusinessIds(req.user);
        return this.spotsService.update(id, body, ownerBusinessIds);
    }
    async remove(id, req) {
        const ownerBusinessIds = await this.getOwnerBusinessIds(req.user);
        return this.spotsService.remove(id, ownerBusinessIds);
    }
    async getOwnerBusinessIds(user) {
        const isSuperadmin = user.role === 'superadmin' || user.username === 'admin';
        if (isSuperadmin) {
            const all = await this.businessRepository.find({ select: ['id'] });
            return all.map((b) => b.id);
        }
        const owned = await this.businessRepository.find({
            where: { owner: { id: user.userId } },
            relations: ['owner'],
            select: ['id'],
        });
        return owned.map((b) => b.id);
    }
};
exports.SpotsController = SpotsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get spots for a business, optionally filtered by date/time availability' }),
    __param(0, (0, common_1.Query)('businessId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Query)('time')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], SpotsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a spot (business admin or superadmin)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SpotsController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update a spot' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], SpotsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a spot' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], SpotsController.prototype, "remove", null);
exports.SpotsController = SpotsController = __decorate([
    (0, swagger_1.ApiTags)('spots'),
    (0, common_1.Controller)('spots'),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __metadata("design:paramtypes", [spots_service_1.SpotsService,
        typeorm_2.Repository])
], SpotsController);
//# sourceMappingURL=spots.controller.js.map