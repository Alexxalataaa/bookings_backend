"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = __importStar(require("crypto"));
const nodemailer = __importStar(require("nodemailer"));
const user_entity_1 = require("./user.entity");
const business_entity_1 = require("../businesses/business.entity");
const service_entity_1 = require("../services/service.entity");
const appointment_entity_1 = require("../appointments/appointment.entity");
const payment_entity_1 = require("../payments/payment.entity");
let AuthService = class AuthService {
    userRepository;
    businessRepository;
    serviceRepository;
    appointmentRepository;
    paymentRepository;
    tokenTtlMs = 24 * 60 * 60 * 1000;
    tokens = new Map();
    tempRegisterCodes = new Map();
    constructor(userRepository, businessRepository, serviceRepository, appointmentRepository, paymentRepository) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.serviceRepository = serviceRepository;
        this.appointmentRepository = appointmentRepository;
        this.paymentRepository = paymentRepository;
    }
    async onModuleInit() {
        let admin = await this.userRepository.findOne({ where: { username: 'admin' } });
        if (!admin) {
            admin = new user_entity_1.User();
            admin.username = 'admin';
            admin.fullName = 'Administrador Principal';
            admin.email = 'admin@bookflow.com';
        }
        admin.role = 'superadmin';
        admin.passwordHash = (0, user_entity_1.hashPassword)('admin');
        admin.isConfirmed = true;
        await this.userRepository.save(admin);
        console.log('Successfully seeded/updated default superadmin user "admin" with password "admin"');
        let client = await this.userRepository.findOne({ where: { username: 'cliente' } });
        if (!client) {
            client = new user_entity_1.User();
            client.username = 'cliente';
            client.fullName = 'Cliente de Prueba';
            client.email = 'cliente@bookflow.com';
            client.role = 'client';
            client.passwordHash = (0, user_entity_1.hashPassword)('1234');
            client.isConfirmed = true;
            await this.userRepository.save(client);
            console.log('Successfully seeded client user "cliente" with password "1234"');
        }
        let owner = await this.userRepository.findOne({ where: { username: 'empresa' } });
        if (!owner) {
            owner = new user_entity_1.User();
            owner.username = 'empresa';
            owner.fullName = 'Empresa de Prueba';
            owner.email = 'empresa@bookflow.com';
            owner.role = 'business';
            owner.passwordHash = (0, user_entity_1.hashPassword)('1234');
            owner.isConfirmed = true;
            await this.userRepository.save(owner);
            console.log('Successfully seeded business owner user "empresa" with password "1234"');
        }
        const businessCount = await this.businessRepository.count();
        if (businessCount === 0) {
            const b1 = this.businessRepository.create({
                name: 'Salón Alicante Futura',
                slug: 'salon-alicante-futura',
                category: 'Estética',
                description: 'El mejor centro de peluquería y estética avanzada en el corazón de Alicante.',
                street: 'Av. Constitución 12',
                city: 'Alicante',
                zipCode: '03002',
                phone: '965123456',
                email: 'salon@alicantefutura.es',
                image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1000&auto=format&fit=crop&q=80',
                logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80',
                hours: JSON.stringify({ monFri: '09:00 - 20:00', sat: '09:00 - 14:00', sun: 'Cerrado' }),
                socialLinks: JSON.stringify({ instagram: 'https://instagram.com/alicantefuturasalon', facebook: 'https://facebook.com/alicantefuturasalon' }),
                gallery: JSON.stringify([
                    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60',
                    'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500&auto=format&fit=crop&q=60',
                    'https://images.unsplash.com/photo-1605497746444-ac9dedd730cf?w=500&auto=format&fit=crop&q=60'
                ]),
                rating: 4.9,
                reviewsCount: 124,
                owner: owner,
            });
            const savedB1 = await this.businessRepository.save(b1);
            const s1_1 = this.serviceRepository.create({ name: 'Corte de Pelo & Estilo', price: 18, duration: 30, business: savedB1 });
            const s1_2 = this.serviceRepository.create({ name: 'Tinte & Color Orgánico', price: 45, duration: 90, business: savedB1 });
            const s1_3 = this.serviceRepository.create({ name: 'Manicura semipermanente', price: 20, duration: 45, business: savedB1 });
            const savedS1_1 = await this.serviceRepository.save(s1_1);
            const savedS1_2 = await this.serviceRepository.save(s1_2);
            const savedS1_3 = await this.serviceRepository.save(s1_3);
            const b2 = this.businessRepository.create({
                name: 'Barbería del Puerto',
                slug: 'barberia-del-puerto',
                category: 'Estética',
                description: 'Barbería clásica con técnicas modernas de afeitado e hidratación facial.',
                street: 'Muelle de Levante 4',
                city: 'Alicante',
                zipCode: '03001',
                phone: '965654321',
                email: 'info@barberiapuerto.es',
                image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1000&auto=format&fit=crop&q=80',
                logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&auto=format&fit=crop&q=80',
                hours: JSON.stringify({ monFri: '10:00 - 21:00', sat: '09:00 - 18:00', sun: 'Cerrado' }),
                socialLinks: JSON.stringify({ instagram: 'https://instagram.com/barberiapuerto' }),
                gallery: JSON.stringify([
                    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=60',
                    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=500&auto=format&fit=crop&q=60'
                ]),
                rating: 4.8,
                reviewsCount: 86,
                owner: owner,
            });
            const savedB2 = await this.businessRepository.save(b2);
            const s2_1 = this.serviceRepository.create({ name: 'Afeitado Clásico con Toalla Caliente', price: 22, duration: 40, business: savedB2 });
            const s2_2 = this.serviceRepository.create({ name: 'Corte Degradado de Barbero', price: 15, duration: 30, business: savedB2 });
            const savedS2_1 = await this.serviceRepository.save(s2_1);
            const savedS2_2 = await this.serviceRepository.save(s2_2);
            const today = new Date().toISOString().split('T')[0];
            const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const a1 = this.appointmentRepository.create({
                date: today,
                time: '10:30',
                status: 'confirmed',
                customerId: client.id,
                businessId: savedB1.id,
                serviceName: savedS1_1.name,
                user: client,
                business: savedB1,
                service: savedS1_1,
            });
            await this.appointmentRepository.save(a1);
            const a2 = this.appointmentRepository.create({
                date: tomorrow,
                time: '12:00',
                status: 'pending',
                customerId: client.id,
                businessId: savedB1.id,
                serviceName: savedS1_3.name,
                user: client,
                business: savedB1,
                service: savedS1_3,
            });
            await this.appointmentRepository.save(a2);
            const a3 = this.appointmentRepository.create({
                date: tomorrow,
                time: '16:30',
                status: 'paid',
                customerId: client.id,
                businessId: savedB2.id,
                serviceName: savedS2_1.name,
                user: client,
                business: savedB2,
                service: savedS2_1,
            });
            await this.appointmentRepository.save(a3);
            const p1 = this.paymentRepository.create({
                clientName: client.fullName,
                businessName: savedB1.name,
                amount: savedS1_1.price,
                method: 'Tarjeta',
                date: today,
                status: 'paid',
                business: savedB1,
            });
            await this.paymentRepository.save(p1);
            const p2 = this.paymentRepository.create({
                clientName: client.fullName,
                businessName: savedB2.name,
                amount: savedS2_1.price,
                method: 'Efectivo',
                date: tomorrow,
                status: 'paid',
                business: savedB2,
            });
            await this.paymentRepository.save(p2);
            console.log('Successfully seeded rich database relationships (Businesses, Services, Appointments, Payments)');
        }
    }
    async send2faEmail(email, code) {
        console.log(`\n==================================================`);
        console.log(`🔑 CÓDIGO DE DOBLE FACTOR DE AUTENTICACIÓN (2FA):`);
        console.log(`Para el correo: ${email}`);
        console.log(`CÓDIGO: ${code}`);
        console.log(`==================================================\n`);
        const emailUser = process.env.EMAIL_USER || 'bookflow.alicantefutura@gmail.com';
        const emailPass = process.env.EMAIL_PASS || 'mzkn nxzy uecr saki';
        try {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: emailUser,
                    pass: emailPass,
                },
            });
            const info = await transporter.sendMail({
                from: `"BookFlow Seguridad" <${emailUser}>`,
                to: email,
                subject: 'Tu código de confirmación de registro (2FA)',
                text: `Hola, tu código de confirmación de registro de 6 dígitos es: ${code}. Expira en 5 minutos.`,
                html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0b0d11; color: #f8fafc; border-radius: 12px; max-width: 500px;">
            <h2 style="color: #6366f1;">Confirmación de Registro en BookFlow</h2>
            <p>Hola,</p>
            <p>Gracias por registrarte en BookFlow. Tu código de verificación de 6 dígitos para confirmar tu cuenta es:</p>
            <div style="font-size: 32px; font-weight: bold; background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.3); padding: 15px; text-align: center; letter-spacing: 4px; color: #6366f1; border-radius: 8px; margin: 20px 0;">
               ${code}
            </div>
            <p style="color: #94a3b8; font-size: 13px;">Este código expira en 5 minutos y es válido para un único uso.</p>
          </div>
        `,
            });
            console.log(`✅ Email enviado con éxito a ${email}: ${info.response}`);
        }
        catch (err) {
            console.error(`❌ Error al enviar email a ${email}:`, err);
        }
    }
    async login(username, password) {
        const trimmed = username.trim();
        const user = await this.userRepository.findOne({
            where: [
                { username: trimmed },
                { email: trimmed }
            ]
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const inputHash = (0, user_entity_1.hashPassword)(password);
        if (user.passwordHash !== inputHash) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (!user.isConfirmed) {
            throw new common_1.UnauthorizedException('Por favor, confirma tu cuenta por correo electrónico antes de iniciar sesión');
        }
        const token = crypto.randomBytes(24).toString('hex');
        const tokenExpiresAt = Date.now() + this.tokenTtlMs;
        this.tokens.set(token, { userId: user.id, username: user.username, role: user.role, expiresAt: tokenExpiresAt });
        return {
            token,
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                email: user.email,
                role: user.role
            }
        };
    }
    async verifyRegister(tempToken, code) {
        const entry = this.tempRegisterCodes.get(tempToken);
        if (!entry) {
            throw new common_1.UnauthorizedException('Sesión de verificación inválida o expirada');
        }
        if (Date.now() > entry.expiresAt) {
            this.tempRegisterCodes.delete(tempToken);
            throw new common_1.UnauthorizedException('El código de verificación ha expirado');
        }
        if (entry.code !== code.trim()) {
            throw new common_1.UnauthorizedException('Código de verificación incorrecto');
        }
        const user = await this.getUserById(entry.userId);
        user.isConfirmed = true;
        await this.userRepository.save(user);
        this.tempRegisterCodes.delete(tempToken);
        return { message: 'Registro verificado y confirmado con éxito' };
    }
    async register(fullName, email, username, password, role = 'client') {
        const trimmedUsername = username.trim();
        const trimmedEmail = email.trim();
        const trimmedFullName = fullName.trim();
        if (!trimmedEmail) {
            throw new common_1.ConflictException('El correo electrónico es requerido');
        }
        const existingUser = await this.userRepository.findOne({ where: { username: trimmedUsername } });
        if (existingUser) {
            throw new common_1.ConflictException('El nombre de usuario ya está en uso');
        }
        const existingEmail = await this.userRepository.findOne({ where: { email: trimmedEmail } });
        if (existingEmail) {
            throw new common_1.ConflictException('El correo electrónico ya está en uso');
        }
        const newUser = new user_entity_1.User();
        newUser.fullName = trimmedFullName;
        newUser.email = trimmedEmail;
        newUser.username = trimmedUsername;
        newUser.passwordHash = (0, user_entity_1.hashPassword)(password);
        newUser.isConfirmed = false;
        newUser.role = role;
        const savedUser = await this.userRepository.save(newUser);
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const tempToken = crypto.randomBytes(24).toString('hex');
        const expiresAt = Date.now() + 5 * 60 * 1000;
        this.tempRegisterCodes.set(tempToken, { userId: savedUser.id, code, expiresAt });
        this.send2faEmail(savedUser.email, code);
        return {
            require2fa: true,
            tempToken,
            message: 'Código de verificación de registro enviado al correo electrónico'
        };
    }
    validateToken(token) {
        const entry = this.tokens.get(token);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.tokens.delete(token);
            return null;
        }
        return { userId: entry.userId, username: entry.username, role: entry.role };
    }
    async getUserById(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.UnauthorizedException('Usuario no encontrado');
        }
        return user;
    }
    async updateProfile(userId, username, password) {
        const user = await this.getUserById(userId);
        if (username && username.trim() !== user.username) {
            const trimmedUsername = username.trim();
            const existingUser = await this.userRepository.findOne({ where: { username: trimmedUsername } });
            if (existingUser && existingUser.id !== userId) {
                throw new common_1.ConflictException('El nombre de usuario ya está en uso');
            }
            user.username = trimmedUsername;
        }
        if (password && password.trim()) {
            const trimmedPassword = password.trim();
            if (trimmedPassword.length < 8) {
                throw new common_1.BadRequestException('La contraseña debe tener al menos 8 caracteres');
            }
            if (!/[0-9]/.test(trimmedPassword)) {
                throw new common_1.BadRequestException('La contraseña debe contener al menos un número');
            }
            if (!/[^A-Za-z0-9\s]/.test(trimmedPassword)) {
                throw new common_1.BadRequestException('La contraseña debe contener al menos un carácter especial');
            }
            user.passwordHash = (0, user_entity_1.hashPassword)(trimmedPassword);
        }
        await this.userRepository.save(user);
        for (const [token, entry] of this.tokens.entries()) {
            if (entry.userId === userId) {
                this.tokens.set(token, { ...entry, username: user.username });
            }
        }
        return {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(2, (0, typeorm_1.InjectRepository)(service_entity_1.Service)),
    __param(3, (0, typeorm_1.InjectRepository)(appointment_entity_1.Appointment)),
    __param(4, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
//# sourceMappingURL=auth.service.js.map