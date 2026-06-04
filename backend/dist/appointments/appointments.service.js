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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const appointment_entity_1 = require("./appointment.entity");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let AppointmentsService = class AppointmentsService {
    appointmentsRepository;
    notificationsGateway;
    constructor(appointmentsRepository, notificationsGateway) {
        this.appointmentsRepository = appointmentsRepository;
        this.notificationsGateway = notificationsGateway;
    }
    async findAll(user, businessId) {
        const isSuperadmin = user.username === 'admin' || user.role === 'superadmin';
        const query = this.appointmentsRepository.createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.user', 'user')
            .leftJoinAndSelect('appointment.business', 'business')
            .leftJoinAndSelect('appointment.service', 'service')
            .orderBy('appointment.date', 'ASC')
            .addOrderBy('appointment.time', 'ASC');
        if (isSuperadmin) {
            if (businessId) {
                query.andWhere('appointment.businessId = :businessId', { businessId });
            }
        }
        else if (user.role === 'business') {
            query.leftJoin('business.owner', 'owner')
                .andWhere('owner.id = :ownerId', { ownerId: user.userId });
            if (businessId) {
                query.andWhere('appointment.businessId = :businessId', { businessId });
            }
        }
        else {
            query.andWhere('appointment.user.id = :clientId', { clientId: user.userId });
        }
        return query.getMany();
    }
    async findOne(id) {
        const appointment = await this.appointmentsRepository.findOne({
            where: { id },
            relations: ['user', 'business', 'service'],
        });
        if (!appointment) {
            throw new common_1.NotFoundException(`No existe la reserva con id ${id}`);
        }
        return appointment;
    }
    async create(createAppointmentDto) {
        const appointment = this.appointmentsRepository.create({
            date: createAppointmentDto.date,
            time: createAppointmentDto.time,
            status: createAppointmentDto.status,
            customerId: createAppointmentDto.customerId,
            businessId: createAppointmentDto.businessId,
            serviceName: createAppointmentDto.serviceName,
            user: createAppointmentDto.userId ? { id: createAppointmentDto.userId } : null,
            business: { id: createAppointmentDto.businessId },
            service: createAppointmentDto.serviceId ? { id: createAppointmentDto.serviceId } : null,
        });
        const saved = await this.appointmentsRepository.save(appointment);
        this.notificationsGateway.sendNotification('Nueva reserva creada');
        return saved;
    }
    async update(id, updateAppointmentDto) {
        const appointment = await this.findOne(id);
        const updatedAppointment = this.appointmentsRepository.merge(appointment, updateAppointmentDto);
        const saved = await this.appointmentsRepository.save(updatedAppointment);
        this.notificationsGateway.sendNotification('Reserva actualizada');
        return saved;
    }
    async remove(id) {
        const appointment = await this.findOne(id);
        await this.appointmentsRepository.remove(appointment);
        this.notificationsGateway.sendNotification('Reserva eliminada');
        return { message: `Reserva ${id} eliminada correctamente` };
    }
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_gateway_1.NotificationsGateway])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map