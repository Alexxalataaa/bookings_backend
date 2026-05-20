import { Injectable, UnauthorizedException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User, hashPassword } from './user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly tokenTtlMs = 24 * 60 * 60 * 1000;

  // Simple in-memory token store (stores userId and username)
  private readonly tokens = new Map<string, { userId: number; username: string; expiresAt: number }>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Seed default user if no users exist
    const count = await this.userRepository.count();
    if (count === 0) {
      const defaultUser = new User();
      defaultUser.username = 'admin';
      defaultUser.passwordHash = hashPassword('1234');
      await this.userRepository.save(defaultUser);
      console.log('Successfully seeded default user "admin" with password "1234"');
    }
  }

  async login(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { username: username.trim() } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + this.tokenTtlMs;
    this.tokens.set(token, { userId: user.id, username: user.username, expiresAt });
    return { token };
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
