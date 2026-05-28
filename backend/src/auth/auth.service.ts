import { Injectable, UnauthorizedException, ConflictException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { User, hashPassword } from './user.entity';
import { Business } from '../businesses/business.entity';
import { Service } from '../services/service.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Payment } from '../payments/payment.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly tokenTtlMs = 24 * 60 * 60 * 1000;

  // Simple in-memory token store (stores userId, username, role)
  private readonly tokens = new Map<string, { userId: number; username: string; role: string; expiresAt: number }>();

  // Simple in-memory registration verification store
  private readonly tempRegisterCodes = new Map<string, { userId: number; code: string; expiresAt: number }>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async onModuleInit() {
    // 1. Seed or update default admin user to have username "admin" and password "admin"
    let admin = await this.userRepository.findOne({ where: { username: 'admin' } });
    if (!admin) {
      admin = new User();
      admin.username = 'admin';
      admin.fullName = 'Administrador Principal';
      admin.email = 'admin@bookflow.com';
    }
    admin.role = 'superadmin';
    admin.passwordHash = hashPassword('admin');
    admin.isConfirmed = true;
    await this.userRepository.save(admin);
    console.log('Successfully seeded/updated default superadmin user "admin" with password "admin"');

    // 2. Seed Client User
    let client = await this.userRepository.findOne({ where: { username: 'client1' } });
    if (!client) {
      client = new User();
      client.username = 'client1';
      client.fullName = 'Cliente Premium';
      client.email = 'client1@bookflow.com';
      client.role = 'client';
      client.passwordHash = hashPassword('client123!');
      client.isConfirmed = true;
      await this.userRepository.save(client);
      console.log('Successfully seeded client user "client1" with password "client123!"');
    }

    // 3. Seed Business Owner User
    let owner = await this.userRepository.findOne({ where: { username: 'owner1' } });
    if (!owner) {
      owner = new User();
      owner.username = 'owner1';
      owner.fullName = 'Propietario de Negocios';
      owner.email = 'owner1@bookflow.com';
      owner.role = 'business';
      owner.passwordHash = hashPassword('owner123!');
      owner.isConfirmed = true;
      await this.userRepository.save(owner);
      console.log('Successfully seeded business owner user "owner1" with password "owner123!"');
    }

    // 4. Seed Businesses and Services if none exist
    const businessCount = await this.businessRepository.count();
    if (businessCount === 0) {
      // Seed Business A: Salón Alicante Futura
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

      // Seed Services for b1
      const s1_1 = this.serviceRepository.create({ name: 'Corte de Pelo & Estilo', price: 18, duration: 30, business: savedB1 });
      const s1_2 = this.serviceRepository.create({ name: 'Tinte & Color Orgánico', price: 45, duration: 90, business: savedB1 });
      const s1_3 = this.serviceRepository.create({ name: 'Manicura semipermanente', price: 20, duration: 45, business: savedB1 });
      const savedS1_1 = await this.serviceRepository.save(s1_1);
      const savedS1_2 = await this.serviceRepository.save(s1_2);
      const savedS1_3 = await this.serviceRepository.save(s1_3);

      // Seed Business B: Barbería del Puerto
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

      // Seed Services for b2
      const s2_1 = this.serviceRepository.create({ name: 'Afeitado Clásico con Toalla Caliente', price: 22, duration: 40, business: savedB2 });
      const s2_2 = this.serviceRepository.create({ name: 'Corte Degradado de Barbero', price: 15, duration: 30, business: savedB2 });
      const savedS2_1 = await this.serviceRepository.save(s2_1);
      const savedS2_2 = await this.serviceRepository.save(s2_2);

      // Seed Appointments
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const a1 = this.appointmentRepository.create({
        date: today,
        time: '10:30',
        status: 'confirmed' as any,
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
        status: 'pending' as any,
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
        status: 'paid' as any,
        customerId: client.id,
        businessId: savedB2.id,
        serviceName: savedS2_1.name,
        user: client,
        business: savedB2,
        service: savedS2_1,
      });
      await this.appointmentRepository.save(a3);

      // Seed Payments
      const p1 = this.paymentRepository.create({
        clientName: client.fullName,
        businessName: savedB1.name,
        amount: savedS1_1.price,
        method: 'Tarjeta',
        date: today,
        status: 'paid' as any,
        business: savedB1,
      });
      await this.paymentRepository.save(p1);

      const p2 = this.paymentRepository.create({
        clientName: client.fullName,
        businessName: savedB2.name,
        amount: savedS2_1.price,
        method: 'Efectivo',
        date: tomorrow,
        status: 'paid' as any,
        business: savedB2,
      });
      await this.paymentRepository.save(p2);

      console.log('Successfully seeded rich database relationships (Businesses, Services, Appointments, Payments)');
    }
  }

  private async send2faEmail(email: string, code: string) {
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
    } catch (err) {
      console.error(`❌ Error al enviar email a ${email}:`, err);
    }
  }

  async login(username: string, password: string) {
    const trimmed = username.trim();
    const user = await this.userRepository.findOne({
      where: [
        { username: trimmed },
        { email: trimmed }
      ]
    });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isConfirmed) {
      throw new UnauthorizedException('Por favor, confirma tu cuenta por correo electrónico antes de iniciar sesión');
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

  async verifyRegister(tempToken: string, code: string) {
    const entry = this.tempRegisterCodes.get(tempToken);
    if (!entry) {
      throw new UnauthorizedException('Sesión de verificación inválida o expirada');
    }

    if (Date.now() > entry.expiresAt) {
      this.tempRegisterCodes.delete(tempToken);
      throw new UnauthorizedException('El código de verificación ha expirado');
    }

    if (entry.code !== code.trim()) {
      throw new UnauthorizedException('Código de verificación incorrecto');
    }

    const user = await this.getUserById(entry.userId);
    user.isConfirmed = true;
    await this.userRepository.save(user);
    this.tempRegisterCodes.delete(tempToken);

    return { message: 'Registro verificado y confirmado con éxito' };
  }

  async register(fullName: string, email: string, username: string, password: string, role = 'client') {
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedFullName = fullName.trim();

    if (!trimmedEmail) {
      throw new ConflictException('El correo electrónico es requerido');
    }

    const existingUser = await this.userRepository.findOne({ where: { username: trimmedUsername } });
    if (existingUser) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const existingEmail = await this.userRepository.findOne({ where: { email: trimmedEmail } });
    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está en uso');
    }

    const newUser = new User();
    newUser.fullName = trimmedFullName;
    newUser.email = trimmedEmail;
    newUser.username = trimmedUsername;
    newUser.passwordHash = hashPassword(password);
    newUser.isConfirmed = false;
    newUser.role = role;

    const savedUser = await this.userRepository.save(newUser);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const tempToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 5 * 60 * 1000;

    this.tempRegisterCodes.set(tempToken, { userId: savedUser.id, code, expiresAt });

    // Send code by email (simulated in logs & attempts actual nodemailer send)
    this.send2faEmail(savedUser.email, code);

    return {
      require2fa: true,
      tempToken,
      message: 'Código de verificación de registro enviado al correo electrónico'
    };
  }

  validateToken(token: string): { userId: number; username: string; role: string } | null {
    const entry = this.tokens.get(token);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.tokens.delete(token);
      return null;
    }
    return { userId: entry.userId, username: entry.username, role: entry.role };
  }

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }

  async updateProfile(userId: number, username?: string, password?: string) {
    const user = await this.getUserById(userId);

    if (username && username.trim() !== user.username) {
      const trimmedUsername = username.trim();
      const existingUser = await this.userRepository.findOne({ where: { username: trimmedUsername } });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('El nombre de usuario ya está en uso');
      }
      user.username = trimmedUsername;
    }

    if (password && password.trim()) {
      const trimmedPassword = password.trim();
      if (trimmedPassword.length < 8) {
        throw new BadRequestException('La contraseña debe tener al menos 8 caracteres');
      }
      if (!/[0-9]/.test(trimmedPassword)) {
        throw new BadRequestException('La contraseña debe contener al menos un número');
      }
      if (!/[^A-Za-z0-9\s]/.test(trimmedPassword)) {
        throw new BadRequestException('La contraseña debe contener al menos un carácter especial');
      }
      user.passwordHash = hashPassword(trimmedPassword);
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
}
