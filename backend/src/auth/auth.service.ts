import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly username = 'admin';
  private readonly password = '1234';
  private readonly tokenTtlMs = 24 * 60 * 60 * 1000;

  // Simple in-memory token store (suficiente para demo)
  private readonly tokens = new Map<string, { expiresAt: number }>();

  login(username: string, password: string) {
    if (username !== this.username || password !== this.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + this.tokenTtlMs;
    this.tokens.set(token, { expiresAt });
    return { token };
  }

  validateToken(token: string): boolean {
    const entry = this.tokens.get(token);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.tokens.delete(token);
      return false;
    }
    return true;
  }
}

