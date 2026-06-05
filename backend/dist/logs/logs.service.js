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
exports.LogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const log_entity_1 = require("./entities/log.entity");
const user_entity_1 = require("../auth/user.entity");
const business_entity_1 = require("../businesses/business.entity");
const appointment_entity_1 = require("../appointments/appointment.entity");
let LogsService = class LogsService {
    logRepository;
    userRepository;
    businessRepository;
    appointmentRepository;
    constructor(logRepository, userRepository, businessRepository, appointmentRepository) {
        this.logRepository = logRepository;
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.appointmentRepository = appointmentRepository;
    }
    async logAction(action, entityName, entityId, userId, details) {
        const log = this.logRepository.create({
            action,
            entityName,
            entityId,
            userId,
            details,
        });
        return this.logRepository.save(log);
    }
    async getLogs(limit = 50) {
        return this.logRepository.find({
            order: { id: 'DESC' },
            take: limit,
        });
    }
    async getMetrics() {
        const totalUsers = await this.userRepository.count();
        const totalBusinesses = await this.businessRepository.count();
        const totalAppointments = await this.appointmentRepository.count();
        const pendingAppointments = await this.appointmentRepository.count({ where: { status: appointment_entity_1.AppointmentStatus.PENDING } });
        const confirmedAppointments = await this.appointmentRepository.count({ where: { status: appointment_entity_1.AppointmentStatus.CONFIRMED } });
        const paidAppointments = await this.appointmentRepository.count({ where: { status: appointment_entity_1.AppointmentStatus.PAID } });
        const totalCustomers = await this.userRepository.count({ where: { role: 'client' } });
        return {
            totalUsers,
            totalBusinesses,
            totalCustomers,
            totalAppointments,
            appointmentsByStatus: {
                pending: pendingAppointments,
                confirmed: confirmedAppointments,
                paid: paidAppointments,
            },
        };
    }
};
exports.LogsService = LogsService;
exports.LogsService = LogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(log_entity_1.SystemLog)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(3, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LogsService);
//# sourceMappingURL=logs.service.js.map