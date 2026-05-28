import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import * as crypto from 'crypto';
import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ default: 'client' })
  role: string; // 'client' | 'business' | 'superadmin'

  @OneToMany(() => Business, (business) => business.owner)
  businesses: Business[];

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];
}
