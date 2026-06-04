import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/user.entity';

@Entity()
export class SystemLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column({ nullable: true })
  entityName: string;

  @Column({ nullable: true })
  entityId: string;

  /**
   * FK to User — identifies who performed the action.
   * SET NULL on delete: logs are preserved even if the user is removed.
   */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL', eager: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  /** Kept as a plain column so existing code reading log.userId still works */
  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  details: string;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;
}
