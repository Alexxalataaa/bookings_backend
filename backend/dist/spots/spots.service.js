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
exports.SpotsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const spot_entity_1 = require("./spot.entity");
const appointment_entity_1 = require("../appointments/appointment.entity");
let SpotsService = class SpotsService {
    spotRepository;
    appointmentRepository;
    constructor(spotRepository, appointmentRepository) {
        this.spotRepository = spotRepository;
        this.appointmentRepository = appointmentRepository;
    }
    async findByBusiness(businessId, date, time) {
        const spots = await this.spotRepository.find({
            where: { businessId },
            order: { posY: 'ASC', posX: 'ASC' },
        });
        if (!date || !time) {
            return spots.map(s => ({ ...s, available: true }));
        }
        const taken = await this.appointmentRepository
            .createQueryBuilder('appointment')
            .select('appointment.spotId')
            .where('appointment.businessId = :businessId', { businessId })
            .andWhere('appointment.date = :date', { date })
            .andWhere('appointment.time = :time', { time })
            .andWhere('appointment.spotId IS NOT NULL')
            .andWhere('appointment.status != :cancelled', { cancelled: 'cancelled' })
            .getMany();
        const takenIds = new Set(taken.map(a => a.spotId));
        return spots.map(s => ({
            ...s,
            available: !takenIds.has(s.id),
        }));
    }
    async isSpotAvailable(spotId, date, time) {
        const count = await this.appointmentRepository.count({
            where: {
                spotId,
                date,
                time,
            },
        });
        return count === 0;
    }
    async create(data, ownerId, ownerBusinessIds) {
        if (!ownerBusinessIds.includes(data.businessId)) {
            throw new common_1.UnauthorizedException('No tienes permisos para este negocio.');
        }
        const spot = this.spotRepository.create(data);
        return this.spotRepository.save(spot);
    }
    async update(id, data, ownerBusinessIds) {
        const spot = await this.spotRepository.findOne({ where: { id } });
        if (!spot)
            throw new common_1.NotFoundException('Puesto no encontrado.');
        if (!ownerBusinessIds.includes(spot.businessId)) {
            throw new common_1.UnauthorizedException('No tienes permisos para este negocio.');
        }
        const updated = this.spotRepository.merge(spot, data);
        return this.spotRepository.save(updated);
    }
    async remove(id, ownerBusinessIds) {
        const spot = await this.spotRepository.findOne({ where: { id } });
        if (!spot)
            throw new common_1.NotFoundException('Puesto no encontrado.');
        if (!ownerBusinessIds.includes(spot.businessId)) {
            throw new common_1.UnauthorizedException('No tienes permisos para este negocio.');
        }
        await this.spotRepository.remove(spot);
        return { success: true };
    }
};
exports.SpotsService = SpotsService;
exports.SpotsService = SpotsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(spot_entity_1.Spot)),
    __param(1, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SpotsService);
//# sourceMappingURL=spots.service.js.map