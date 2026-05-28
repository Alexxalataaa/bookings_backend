import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';

@Entity()
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  duration: number; // in minutes

  @ManyToOne(() => Business, (business) => business.services, { onDelete: 'CASCADE' })
  business: Business;

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];
}
