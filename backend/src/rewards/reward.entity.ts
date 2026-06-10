import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';

@Entity()
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  @Column({ type: 'text', nullable: true })
  conditions?: string;
  description: string;

  @Column({ type: 'date', nullable: true })
  validUntil: string;

  @Column({ type: 'int', nullable: true })
  pointsRequired: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Business, (business) => business.rewards, { onDelete: 'CASCADE' })
  business: Business;

  @ManyToOne(() => User, (user) => user.rewards, { nullable: true, onDelete: 'SET NULL' })
  winner: User;
}
