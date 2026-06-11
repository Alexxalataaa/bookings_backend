import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../auth/user.entity';
import { Business } from '../businesses/business.entity';
import { Service } from '../services/service.entity';
import { Spot } from '../spots/spot.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  date: string;

  @Column()
  time: string;

  @Column({
    type: 'text',
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ nullable: true })
  customerId: number; // Keep for backward-compatibility / guest bookings

  @Column({ nullable: true })
  businessId: number;

  @Column({ nullable: true })
  serviceName: string;

  @ManyToOne(() => User, (user) => user.appointments, { nullable: true, onDelete: 'SET NULL' })
  user: User;

  @ManyToOne(() => Business, (business) => business.appointments, { onDelete: 'CASCADE' })
  business: Business;

  @ManyToOne(() => Service, (service) => service.appointments, { nullable: true, onDelete: 'SET NULL' })
  service: Service;

  @Column({ nullable: true })
  spotId: number;

  @ManyToOne(() => Spot, (spot) => spot.appointments, { nullable: true, onDelete: 'SET NULL' })
  spot: Spot;

  @Column({ default: false })
  pointsAwarded: boolean;
}