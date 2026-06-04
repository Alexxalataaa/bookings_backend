import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from './business.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class BusinessesService {
  constructor(
    @InjectRepository(Business)
    private readonly businessRepository: Repository<Business>,
  ) {}

  async findAll() {
    return this.businessRepository.find({
      where: { isSuspended: false },
      relations: ['services'],
    });
  }

  async findAllForSuperadmin() {
    return this.businessRepository.find({
      relations: ['owner'],
    });
  }

  async findByOwner(ownerId: number) {
    return this.businessRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['services'],
    });
  }

  async findOne(idOrSlug: string | number) {
    let business: Business | null = null;
    if (typeof idOrSlug === 'number' || !isNaN(Number(idOrSlug))) {
      business = await this.businessRepository.findOne({
        where: { id: Number(idOrSlug) },
        relations: ['services', 'owner'],
      });
    } else {
      business = await this.businessRepository.findOne({
        where: { slug: String(idOrSlug) },
        relations: ['services', 'owner'],
      });
    }

    if (!business) {
      throw new NotFoundException(`Negocio no encontrado`);
    }
    return business;
  }

  async create(data: any, owner: any) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await this.businessRepository.findOne({ where: { slug } });
    if (existing) {
      data.slug = `${slug}-${Date.now().toString().slice(-4)}`;
    } else {
      data.slug = slug;
    }

    const business = this.businessRepository.create({
      ...data,
      owner: { id: owner.userId } as User,
    });
    return this.businessRepository.save(business);
  }

  async update(id: number, data: any, ownerId: number, isSuperadmin = false) {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException(`Negocio no encontrado`);
    }

    if (!isSuperadmin && business.owner.id !== ownerId) {
      throw new UnauthorizedException(`No tienes permisos para editar este negocio`);
    }

    const updated = this.businessRepository.merge(business, data);
    return this.businessRepository.save(updated);
  }

  async delete(id: number, ownerId: number, isSuperadmin = false) {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!business) {
      throw new NotFoundException(`Negocio no encontrado`);
    }

    if (!isSuperadmin && business.owner.id !== ownerId) {
      throw new UnauthorizedException(`No tienes permisos para eliminar este negocio`);
    }

    await this.businessRepository.remove(business);
    return { success: true };
  }
}
