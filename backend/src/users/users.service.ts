import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, hashPassword } from '../auth/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.userRepository.find({
      select: ['id', 'fullName', 'email', 'username', 'role', 'isConfirmed'],
      order: { id: 'DESC' },
    });
  }

  async create(data: any) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: data.email }, { username: data.username }],
    });
    if (existingUser) {
      throw new BadRequestException('El usuario o email ya existe');
    }

    const user = this.userRepository.create({
      ...data,
      passwordHash: hashPassword(data.password),
      isConfirmed: true,
    });
    const saved = await this.userRepository.save(user);
    const { passwordHash, ...result } = saved as any;
    return result;
  }

  async update(id: number, data: any) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (data.password) {
      data.passwordHash = hashPassword(data.password);
      delete data.password;
    }

    const updated = this.userRepository.merge(user, data);
    const saved = await this.userRepository.save(updated);
    const { passwordHash, ...result } = saved as any;
    return result;
  }

  async delete(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    if (user.username === 'admin') {
      throw new BadRequestException('No se puede eliminar el superadmin principal');
    }

    await this.userRepository.remove(user);
    return { success: true };
  }
}
