import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { Business } from '../businesses/business.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientName: string;

  @Column()
  businessName: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  method: string;

  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'text',
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Business, (business) => business.payments, { nullable: true, onDelete: 'SET NULL' })
  business: Business;
}
