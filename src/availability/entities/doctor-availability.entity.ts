import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';

@Entity()
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dayOfWeek: string; // "Monday", "Tuesday", etc.

  @Column()
  startTime: string; // "09:00"

  @Column()
  endTime: string; // "13:00"

  @Column({ type: 'int', default: 15 })
  defaultSlotDuration: number;

  @Column({ type: 'int', nullable: true })
  maxBookings?: number; // Only relevant for wave mode slots; optional

  @ManyToOne(() => Doctor, doctor => doctor.availabilities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  doctorId: number;
}
