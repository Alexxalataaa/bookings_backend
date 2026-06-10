import { Column, Entity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn } from 'typeorm';
import * as crypto from 'crypto';
import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';
import { Reward } from '../rewards/reward.entity';

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  /**
   * Nullable to support CRM-only clients (not login accounts).
   * Uniqueness is enforced at service level for login-capable accounts.
   */
  @Column({ nullable: true })
  email: string;

  /**
   * Nullable to support CRM-only clients (not login accounts).
   * Uniqueness is enforced at service level for login-capable accounts.
   */
  @Column({ nullable: true })
  username: string;

  /** Nullable: CRM-only clients do not have a password */
  @Column({ nullable: true })
  passwordHash: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ default: 'client' })
  role: string; // 'client' | 'business' | 'superadmin'

  /** Phone number — used by CRM clients added manually by business owners */
  @Column({ nullable: true })
  phone: string;

  /**
   * Name of the business/company associated with this CRM client.
   * Named customerBusiness to avoid confusion with the Business entity.
   */
  @Column({ nullable: true })
  customerBusiness: string;

  /** Auto-set on creation — used by CRM clients */
  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Business, (business) => business.owner)
  businesses: Business[];

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  @OneToMany(() => Reward, (reward) => reward.winner)
  rewards: Reward[];
}
