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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../auth/user.entity");
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async findAll() {
        return this.userRepository.find({
            select: ['id', 'fullName', 'email', 'username', 'role', 'isConfirmed'],
            where: [{ role: 'superadmin' }, { role: 'business' }],
            order: { id: 'DESC' },
        });
    }
    async create(data) {
        const existingUser = await this.userRepository.findOne({
            where: [{ email: data.email }, { username: data.username }],
        });
        if (existingUser) {
            throw new common_1.BadRequestException('El usuario o email ya existe');
        }
        const user = this.userRepository.create({
            ...data,
            passwordHash: (0, user_entity_1.hashPassword)(data.password),
            isConfirmed: true,
        });
        const saved = await this.userRepository.save(user);
        const { passwordHash, ...result } = saved;
        return result;
    }
    async update(id, data) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        if (data.password) {
            data.passwordHash = (0, user_entity_1.hashPassword)(data.password);
            delete data.password;
        }
        const updated = this.userRepository.merge(user, data);
        const saved = await this.userRepository.save(updated);
        const { passwordHash, ...result } = saved;
        return result;
    }
    async delete(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        if (user.username === 'admin') {
            throw new common_1.BadRequestException('No se puede eliminar el superadmin principal');
        }
        await this.userRepository.remove(user);
        return { success: true };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map