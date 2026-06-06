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
var SpotsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const spot_entity_1 = require("./spot.entity");
const appointment_entity_1 = require("../appointments/appointment.entity");
const business_entity_1 = require("../businesses/business.entity");
function defaultSpotsForCategory(category) {
    const cat = (category || '').toLowerCase();
    if (cat.includes('peluquer') || cat.includes('barber') || cat.includes('salon') || cat.includes('salón') || cat.includes('belleza') || cat.includes('estética')) {
        return [
            { name: 'Silla 1', label: 'S1', color: '#6366f1' },
            { name: 'Silla 2', label: 'S2', color: '#a855f7' },
            { name: 'Silla 3', label: 'S3', color: '#8b5cf6' },
            { name: 'Lavacabezas', label: 'LV', color: '#3b82f6' },
        ];
    }
    if (cat.includes('spa') || cat.includes('masaje') || cat.includes('wellness') || cat.includes('relax')) {
        return [
            { name: 'Camilla 1', label: 'C1', color: '#10b981' },
            { name: 'Camilla 2', label: 'C2', color: '#34d399' },
            { name: 'Cabina VIP', label: 'VIP', color: '#f59e0b' },
        ];
    }
    if (cat.includes('cowork') || cat.includes('oficina') || cat.includes('despacho') || cat.includes('trabajo')) {
        return [
            { name: 'Mesa A', label: 'MA', color: '#3b82f6' },
            { name: 'Mesa B', label: 'MB', color: '#60a5fa' },
            { name: 'Sala Reuniones', label: 'SR', color: '#f43f5e' },
            { name: 'Cabina Privada', label: 'CP', color: '#a855f7' },
        ];
    }
    if (cat.includes('médico') || cat.includes('medico') || cat.includes('clínica') || cat.includes('clinica') || cat.includes('salud')) {
        return [
            { name: 'Consulta 1', label: 'C1', color: '#10b981' },
            { name: 'Consulta 2', label: 'C2', color: '#34d399' },
        ];
    }
    if (cat.includes('dentista') || cat.includes('dental') || cat.includes('odonto')) {
        return [
            { name: 'Sillón 1', label: 'D1', color: '#3b82f6' },
            { name: 'Sillón 2', label: 'D2', color: '#60a5fa' },
        ];
    }
    if (cat.includes('fotograf') || cat.includes('estudio')) {
        return [
            { name: 'Estudio Principal', label: 'EP', color: '#f43f5e' },
            { name: 'Estudio Exterior', label: 'EX', color: '#f59e0b' },
            { name: 'Set Maquillaje', label: 'MQ', color: '#ec4899' },
        ];
    }
    if (cat.includes('fitnes') || cat.includes('gimnasio') || cat.includes('gym') || cat.includes('yoga') || cat.includes('pilates')) {
        return [
            { name: 'Zona A', label: 'ZA', color: '#f59e0b' },
            { name: 'Zona B', label: 'ZB', color: '#ef4444' },
            { name: 'Sala Grupal', label: 'SG', color: '#10b981' },
        ];
    }
    return [
        { name: 'Puesto 1', label: 'P1', color: '#6366f1' },
        { name: 'Puesto 2', label: 'P2', color: '#a855f7' },
    ];
}
let SpotsService = SpotsService_1 = class SpotsService {
    spotRepository;
    appointmentRepository;
    businessRepository;
    logger = new common_1.Logger(SpotsService_1.name);
    constructor(spotRepository, appointmentRepository, businessRepository) {
        this.spotRepository = spotRepository;
        this.appointmentRepository = appointmentRepository;
        this.businessRepository = businessRepository;
    }
    async onModuleInit() {
        try {
            const businesses = await this.businessRepository.find();
            let seeded = 0;
            for (const biz of businesses) {
                const existingCount = await this.spotRepository.count({ where: { businessId: biz.id } });
                if (existingCount > 0)
                    continue;
                const defaults = defaultSpotsForCategory(biz.category || '');
                const positions = [
                    { posX: 0, posY: 0 }, { posX: 1, posY: 0 },
                    { posX: 2, posY: 0 }, { posX: 3, posY: 0 },
                ];
                for (let i = 0; i < defaults.length; i++) {
                    const pos = positions[i] ?? { posX: i, posY: 0 };
                    await this.spotRepository.save(this.spotRepository.create({
                        name: defaults[i].name,
                        label: defaults[i].label,
                        color: defaults[i].color,
                        posX: pos.posX,
                        posY: pos.posY,
                        businessId: biz.id,
                    }));
                    seeded++;
                }
            }
            if (seeded > 0) {
                this.logger.log(`✅ Auto-seeded ${seeded} default spots across businesses`);
            }
        }
        catch (err) {
            this.logger.warn(`Spot seeding skipped: ${err}`);
        }
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
            where: { spotId, date, time },
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
exports.SpotsService = SpotsService = SpotsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(spot_entity_1.Spot)),
    __param(1, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SpotsService);
//# sourceMappingURL=spots.service.js.map