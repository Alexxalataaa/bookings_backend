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
exports.BusinessesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("./business.entity");
let BusinessesService = class BusinessesService {
    businessRepository;
    constructor(businessRepository) {
        this.businessRepository = businessRepository;
    }
    async findAll() {
        return this.businessRepository.find({
            where: { isSuspended: false },
            relations: ['services'],
        });
    }
    async findAllForSuperadmin() {
        return this.businessRepository.find({
            relations: ['owner'],
        });
    }
    async findByOwner(ownerId) {
        return this.businessRepository.find({
            where: { owner: { id: ownerId } },
            relations: ['services'],
        });
    }
    async findOne(idOrSlug) {
        let business = null;
        if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
            business = await this.businessRepository.findOne({
                where: { id: Number(idOrSlug) },
                relations: ['services', 'owner'],
            });
        }
        else {
            business = await this.businessRepository.findOne({
                where: { slug: String(idOrSlug) },
                relations: ['services', 'owner'],
            });
        }
        if (!business) {
            throw new common_1.NotFoundException(`Negocio no encontrado`);
        }
        return business;
    }
    async create(data, owner) {
        const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const existing = await this.businessRepository.findOne({ where: { slug } });
        if (existing) {
            data.slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        else {
            data.slug = slug;
        }
        const business = this.businessRepository.create({
            ...data,
            owner: { id: owner.userId },
        });
        return this.businessRepository.save(business);
    }
    async update(id, data, ownerId, isSuperadmin = false) {
        const business = await this.businessRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!business) {
            throw new common_1.NotFoundException(`Negocio no encontrado`);
        }
        if (!isSuperadmin && business.owner.id !== ownerId) {
            throw new common_1.UnauthorizedException(`No tienes permisos para editar este negocio`);
        }
        const updated = this.businessRepository.merge(business, data);
        return this.businessRepository.save(updated);
    }
    async delete(id, ownerId, isSuperadmin = false) {
        const business = await this.businessRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!business) {
            throw new common_1.NotFoundException(`Negocio no encontrado`);
        }
        if (!isSuperadmin && business.owner.id !== ownerId) {
            throw new common_1.UnauthorizedException(`No tienes permisos para eliminar este negocio`);
        }
        await this.businessRepository.remove(business);
        return { success: true };
    }
};
exports.BusinessesService = BusinessesService;
exports.BusinessesService = BusinessesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BusinessesService);
//# sourceMappingURL=businesses.service.js.map