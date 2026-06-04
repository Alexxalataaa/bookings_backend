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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const verify_2fa_dto_1 = require("./dto/verify-2fa.dto");
const auth_guard_1 = require("./auth.guard");
const update_profile_dto_1 = require("./dto/update-profile.dto");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    login(body) {
        return this.authService.login(body.username, body.password);
    }
    verifyRegister(body) {
        return this.authService.verifyRegister(body.tempToken, body.code);
    }
    register(body) {
        return this.authService.register(body.fullName, body.email, body.username, body.password, body.role);
    }
    async getProfile(req) {
        const user = await this.authService.getUserById(req.user.userId);
        return {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
        };
    }
    async updateProfile(req, body) {
        return this.authService.updateProfile(req.user.userId, body.username, body.password);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Login de admin' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('verify-register'),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Verificar código de confirmación de registro' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_2fa_dto_1.Verify2faDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifyRegister", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Registro de usuario exitoso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Obtener perfil del usuario' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Actualizar perfil del usuario' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_profile_dto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "updateProfile", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map