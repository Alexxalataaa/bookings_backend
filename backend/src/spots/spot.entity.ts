import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Business } from '../businesses/business.entity';
import { Appointment } from '../appointments/appointment.entity';

@Entity()
export class Spot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // e.g. "Camilla 1", "Mesa VIP", "Cabina A"

  @Column({ nullable: true })
  label: string; // short label for the map cell, e.g. "C1"

  @Column({ default: 0 })
  posX: number; // column in grid (0-based)

  @Column({ default: 0 })
  posY: number; // row in grid (0-based)

  @Column({ nullable: true })
  color: string; // optional custom accent color

  @Column()
  businessId: number;

  @ManyToOne(() => Business, (business) => business.spots, { onDelete: 'CASCADE' })
  business: Business;

  @OneToMany(() => Appointment, (appointment) => appointment.spot)
  appointments: Appointment[];
}
