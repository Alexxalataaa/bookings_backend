import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../auth/user.entity';
import { Service } from '../services/service.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Payment } from '../payments/payment.entity';
import { Spot } from '../spots/spot.entity';

@Entity()
export class Business {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  street: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  zipCode: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  image: string; // banner image URL

  @Column({ nullable: true })
  logo: string; // logo image URL

  @Column({ nullable: true })
  hours: string; // JSON string for opening hours

  @Column({ nullable: true })
  socialLinks: string; // JSON string for social links

  @Column({ nullable: true })
  gallery: string; // JSON string for gallery image URLs

  @Column({ type: 'float', default: 4.8 })
  rating: number;

  @Column({ default: 0 })
  reviewsCount: number;

  @Column({ default: false })
  isSuspended: boolean;

  @Column({ default: 8 })
  mapCols: number;

  @Column({ default: 6 })
  mapRows: number;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @ManyToOne(() => User, (user) => user.businesses, { onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => Service, (service) => service.business)
  services: Service[];

  @OneToMany(() => Appointment, (appointment) => appointment.business)
  appointments: Appointment[];

  @OneToMany(() => Payment, (payment) => payment.business)
  payments: Payment[];

  @OneToMany(() => Spot, (spot) => spot.business)
  spots: Spot[];
}

