import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';

@Entity()
export class Reward {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  validUntil: string;

  @Column({ nullable: true })
  pointsRequired: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;

  @ManyToOne(() => User, { nullable: true, eager: true })
  winner: User | null;

  @ManyToOne(() => Business, (business) => business.rewards, { onDelete: 'CASCADE' })
  business: Business;
}
