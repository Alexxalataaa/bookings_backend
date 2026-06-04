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
exports.ServicesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_entity_1 = require("./service.entity");
const businesses_service_1 = require("../businesses/businesses.service");
let ServicesService = class ServicesService {
    serviceRepository;
    businessesService;
    constructor(serviceRepository, businessesService) {
        this.serviceRepository = serviceRepository;
        this.businessesService = businessesService;
    }
    async findByBusiness(businessId) {
        return this.serviceRepository.find({
            where: { business: { id: businessId } },
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const service = await this.serviceRepository.findOne({
            where: { id },
            relations: ['business', 'business.owner'],
        });
        if (!service) {
            throw new common_1.NotFoundException(`Servicio no encontrado`);
        }
        return service;
    }
    async create(data, ownerId) {
        const businessId = Number(data.businessId);
        const business = await this.businessesService.findOne(businessId);
        if (business.owner.id !== ownerId) {
            throw new common_1.UnauthorizedException(`No tienes permisos para añadir servicios a este negocio`);
        }
        const service = this.serviceRepository.create({
            name: data.name,
            description: data.description,
            price: data.price,
            duration: data.duration,
            business,
        });
        return this.serviceRepository.save(service);
    }
    async update(id, data, ownerId) {
        const service = await this.findOne(id);
        if (service.business.owner.id !== ownerId) {
            throw new common_1.UnauthorizedException(`No tienes permisos para modificar este servicio`);
        }
        const updated = this.serviceRepository.merge(service, {
            name: data.name,
            description: data.description,
            price: data.price,
            duration: data.duration,
        });
        return this.serviceRepository.save(updated);
    }
    async delete(id, ownerId) {
        const service = await this.findOne(id);
        if (service.business.owner.id !== ownerId) {
            throw new common_1.UnauthorizedException(`No tienes permisos para eliminar este servicio`);
        }
        await this.serviceRepository.remove(service);
        return { success: true };
    }
};
exports.ServicesService = ServicesService;
exports.ServicesService = ServicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        businesses_service_1.BusinessesService])
], ServicesService);
//# sourceMappingURL=services.service.js.map