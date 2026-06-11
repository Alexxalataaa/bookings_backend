import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Business } from '../businesses/business.entity';
import { User } from '../auth/user.entity';

@Entity()
export class ClientProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  points: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  business: Business;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: string;
}
