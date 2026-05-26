import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { User, hashPassword } from './user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly tokenTtlMs = 24 * 60 * 60 * 1000;

  // Simple in-memory token store (stores userId and username)
  private readonly tokens = new Map<string, { userId: number; username: string; expiresAt: number }>();

  // Simple in-memory registration verification store
  private readonly tempRegisterCodes = new Map<string, { userId: number; code: string; expiresAt: number }>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Seed or update default admin user to have username "admin" and password "admin"
    let admin = await this.userRepository.findOne({ where: { username: 'admin' } });
    if (!admin) {
      admin = new User();
      admin.username = 'admin';
      admin.fullName = 'Administrador Principal';
      admin.email = 'admin@bookflow.com';
    }

    admin.passwordHash = hashPassword('admin');
    admin.isConfirmed = true;
    await this.userRepository.save(admin);
    console.log('Successfully seeded/updated default confirmed user "admin" with password "admin"');
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

    // Generate actual JWT token directly
    const token = crypto.randomBytes(24).toString('hex');
    const tokenExpiresAt = Date.now() + this.tokenTtlMs;
    this.tokens.set(token, { userId: user.id, username: user.username, expiresAt: tokenExpiresAt });

    return { token };
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

    // Confirm user
    const user = await this.getUserById(entry.userId);
    user.isConfirmed = true;
    await this.userRepository.save(user);

    // Invalidate session
    this.tempRegisterCodes.delete(tempToken);

    return { message: 'Registro verificado y confirmado con éxito' };
  }

  async register(fullName: string, email: string, username: string, password: string) {
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

    const savedUser = await this.userRepository.save(newUser);

    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Generate temporary verification token
    const tempToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL

    this.tempRegisterCodes.set(tempToken, { userId: savedUser.id, code, expiresAt });

    // Send email asynchronously
    this.send2faEmail(savedUser.email, code);

    return {
      require2fa: true,
      tempToken,
      message: 'Código de verificación de registro enviado al correo electrónico'
    };
  }

  validateToken(token: string): { userId: number; username: string } | null {
    const entry = this.tokens.get(token);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.tokens.delete(token);
      return null;
    }
    return { userId: entry.userId, username: entry.username };
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
      user.passwordHash = hashPassword(password);
    }

    await this.userRepository.save(user);

    // Update in-memory tokens if username changed
    for (const [token, entry] of this.tokens.entries()) {
      if (entry.userId === userId) {
        this.tokens.set(token, { ...entry, username: user.username });
      }
    }

    return {
      id: user.id,
      username: user.username,
    };
  }
}
