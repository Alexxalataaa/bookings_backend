import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { BusinessesService } from '../businesses/businesses.service';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    private readonly businessesService: BusinessesService,
  ) {}

  async findByBusiness(businessId: number) {
    return this.serviceRepository.find({
      where: { business: { id: businessId } },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number) {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['business', 'business.owner'],
    });
    if (!service) {
      throw new NotFoundException(`Servicio no encontrado`);
    }
    return service;
  }

  async create(data: any, ownerId: number) {
    const businessId = Number(data.businessId);
    const business = await this.businessesService.findOne(businessId);

    if (business.owner.id !== ownerId) {
      throw new UnauthorizedException(`No tienes permisos para añadir servicios a este negocio`);
    }

    const service = this.serviceRepository.create({
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      business,
    });

    return this.serviceRepository.save(service);
  }

  async update(id: number, data: any, ownerId: number) {
    const service = await this.findOne(id);

    if (service.business.owner.id !== ownerId) {
      throw new UnauthorizedException(`No tienes permisos para modificar este servicio`);
    }

    const updated = this.serviceRepository.merge(service, {
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
    });

    return this.serviceRepository.save(updated);
  }

  async delete(id: number, ownerId: number) {
    const service = await this.findOne(id);

    if (service.business.owner.id !== ownerId) {
      throw new UnauthorizedException(`No tienes permisos para eliminar este servicio`);
    }

    await this.serviceRepository.remove(service);
    return { success: true };
  }
}
