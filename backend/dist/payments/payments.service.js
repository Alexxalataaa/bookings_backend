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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./payment.entity");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
let PaymentsService = class PaymentsService {
    paymentRepository;
    notificationsGateway;
    constructor(paymentRepository, notificationsGateway) {
        this.paymentRepository = paymentRepository;
        this.notificationsGateway = notificationsGateway;
    }
    async findAll(user, range, businessId) {
        const isSuperadmin = user.username === 'admin' || user.role === 'superadmin';
        const query = this.paymentRepository.createQueryBuilder('payment')
            .leftJoinAndSelect('payment.business', 'business')
            .orderBy('payment.date', 'DESC');
        if (isSuperadmin) {
            if (businessId) {
                query.andWhere('payment.businessId = :businessId', { businessId });
            }
        }
        else if (user.role === 'business') {
            query.leftJoin('business.owner', 'owner')
                .andWhere('owner.id = :ownerId', { ownerId: user.userId });
            if (businessId) {
                query.andWhere('payment.businessId = :businessId', { businessId });
            }
        }
        else {
            query.andWhere('payment.clientName = :fullName', { fullName: user.username });
        }
        if (range) {
            const now = new Date();
            let start = undefined;
            let end = undefined;
            if (range === 'hoy') {
                const d = new Date(now);
                start = d.toISOString().split('T')[0];
                end = d.toISOString().split('T')[0];
            }
            else if (range === 'semana') {
                const startOfWeek = new Date(now);
                const day = startOfWeek.getDay();
                const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
                startOfWeek.setDate(diff);
                start = startOfWeek.toISOString().split('T')[0];
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                end = endOfWeek.toISOString().split('T')[0];
            }
            else if (range === 'mes') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                start = startOfMonth.toISOString().split('T')[0];
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                end = endOfMonth.toISOString().split('T')[0];
            }
            else if (range === 'año' || range === 'anio') {
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                start = startOfYear.toISOString().split('T')[0];
                const endOfYear = new Date(now.getFullYear(), 11, 31);
                end = endOfYear.toISOString().split('T')[0];
            }
            if (start && end) {
                query.andWhere('payment.date BETWEEN :start AND :end', { start, end });
            }
        }
        return query.getMany();
    }
    async findOne(id) {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['business'],
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
    async create(createPaymentDto) {
        const payment = this.paymentRepository.create({
            clientName: createPaymentDto.clientName,
            businessName: createPaymentDto.businessName,
            amount: createPaymentDto.amount,
            method: createPaymentDto.method,
            date: createPaymentDto.date,
            status: createPaymentDto.status,
            business: createPaymentDto.businessId ? { id: createPaymentDto.businessId } : null,
        });
        const saved = await this.paymentRepository.save(payment);
        this.notificationsGateway.sendNotification('Nuevo pago creado');
        return saved;
    }
    async update(id, updatePaymentDto) {
        const payment = await this.findOne(id);
        Object.assign(payment, updatePaymentDto);
        const saved = await this.paymentRepository.save(payment);
        this.notificationsGateway.sendNotification('Pago actualizado');
        return saved;
    }
    async remove(id) {
        const payment = await this.findOne(id);
        await this.paymentRepository.remove(payment);
        this.notificationsGateway.sendNotification('Pago eliminado');
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_gateway_1.NotificationsGateway])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map