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
exports.LogsController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const log_entity_1 = require("./entities/log.entity");
const user_entity_1 = require("../auth/user.entity");
const business_entity_1 = require("../businesses/business.entity");
const appointment_entity_1 = require("../appointments/appointment.entity");
const auth_guard_1 = require("../auth/auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let LogsController = class LogsController {
    logRepo;
    userRepo;
    businessRepo;
    appointmentRepo;
    constructor(logRepo, userRepo, businessRepo, appointmentRepo) {
        this.logRepo = logRepo;
        this.userRepo = userRepo;
        this.businessRepo = businessRepo;
        this.appointmentRepo = appointmentRepo;
    }
    async findAll(limit = '50') {
        const parsed = Number(limit) || 50;
        return this.logRepo.find({ order: { id: 'DESC' }, take: parsed });
    }
    async metrics() {
        const [totalUsers, totalCustomers, totalBusinesses, totalAppointments] = await Promise.all([
            this.userRepo.count(),
            this.userRepo.count({ where: { role: 'client' } }),
            this.businessRepo.count(),
            this.appointmentRepo.count(),
        ]);
        return {
            totalUsers,
            totalCustomers,
            totalBusinesses,
            totalAppointments,
        };
    }
};
exports.LogsController = LogsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LogsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LogsController.prototype, "metrics", null);
exports.LogsController = LogsController = __decorate([
    (0, common_1.Controller)('logs'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('superadmin'),
    __param(0, (0, typeorm_1.InjectRepository)(log_entity_1.SystemLog)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(3, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], LogsController);
//# sourceMappingURL=logs.controller.js.map