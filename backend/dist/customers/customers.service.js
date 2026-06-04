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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../auth/user.entity");
const notifications_gateway_1 = require("../notifications/notifications.gateway");
function mapUserToCustomer(user) {
    return {
        id: user.id,
        name: user.fullName,
        email: user.email ?? null,
        phone: user.phone ?? null,
        business: user.customerBusiness ?? null,
        createdAt: user.createdAt,
    };
}
let CustomersService = class CustomersService {
    userRepository;
    notificationsGateway;
    constructor(userRepository, notificationsGateway) {
        this.userRepository = userRepository;
        this.notificationsGateway = notificationsGateway;
    }
    async findAll() {
        const users = await this.userRepository.find({
            where: { role: 'client' },
            order: { createdAt: 'DESC' },
        });
        return users.map(mapUserToCustomer);
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id, role: 'client' },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        return mapUserToCustomer(user);
    }
    async create(createCustomerDto) {
        const { name, email, phone, business } = createCustomerDto;
        if (phone) {
            const phoneStr = String(phone).trim();
            const digits = phoneStr.replace(/\D/g, '');
            if (digits.length !== 11) {
                throw new common_1.BadRequestException('El numero tiene que tener 9 digitos');
            }
            if (!/^\+\d{2} \d{3} \d{3} \d{3}$/.test(phoneStr)) {
                throw new common_1.BadRequestException('El formato del numero esta mal');
            }
        }
        const existingClients = await this.userRepository.find({ where: { role: 'client' } });
        const isDuplicate = existingClients.some(c => c.fullName.toLowerCase() === name.toLowerCase() ||
            (c.email && email && c.email.toLowerCase() === email.toLowerCase()) ||
            (c.phone && phone && c.phone === phone));
        if (isDuplicate) {
            const duplicatePhone = existingClients.some(c => c.phone && phone && c.phone === phone);
            if (duplicatePhone) {
                throw new common_1.BadRequestException('Este numero ya existe');
            }
            throw new common_1.BadRequestException('Este cliente ya existe');
        }
        const newUser = new user_entity_1.User();
        newUser.fullName = name;
        if (email)
            newUser.email = email;
        if (phone)
            newUser.phone = phone;
        if (business)
            newUser.customerBusiness = business;
        newUser.role = 'client';
        newUser.isConfirmed = false;
        const saved = await this.userRepository.save(newUser);
        this.notificationsGateway.sendNotification('Nuevo cliente creado');
        return mapUserToCustomer(saved);
    }
    async update(id, updateCustomerDto) {
        const user = await this.userRepository.findOne({ where: { id, role: 'client' } });
        if (!user) {
            throw new common_1.NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        if (updateCustomerDto.name !== undefined)
            user.fullName = updateCustomerDto.name;
        if (updateCustomerDto.email !== undefined)
            user.email = updateCustomerDto.email ?? null;
        if (updateCustomerDto.phone !== undefined)
            user.phone = updateCustomerDto.phone ?? null;
        if (updateCustomerDto.business !== undefined)
            user.customerBusiness = updateCustomerDto.business ?? null;
        const saved = await this.userRepository.save(user);
        this.notificationsGateway.sendNotification('Cliente actualizado');
        return mapUserToCustomer(saved);
    }
    async remove(id) {
        const user = await this.userRepository.findOne({ where: { id, role: 'client' } });
        if (!user) {
            throw new common_1.NotFoundException(`Cliente con ID ${id} no encontrado`);
        }
        await this.userRepository.remove(user);
        this.notificationsGateway.sendNotification('Cliente eliminado');
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        notifications_gateway_1.NotificationsGateway])
], CustomersService);
//# sourceMappingURL=customers.service.js.map