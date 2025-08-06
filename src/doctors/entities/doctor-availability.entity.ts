import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { DoctorTimeslot } from './doctor-timeslot.entity';

@Entity()
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dayOfWeek: string; // e.g., "Monday"

  @ManyToOne(() => Doctor, doctor => doctor.availabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;

  @Column()
  doctorId: number;

  @Column()
  startTime: string; // e.g., "09:00"

  @Column()
  endTime: string; // e.g., "13:00"

  @OneToMany(() => DoctorTimeslot, timeslot => timeslot.availability)
  timeslots: DoctorTimeslot[];

  @Column({ type: 'int', nullable: true })
  maxBookings?: number;

  @Column({ type: 'int', default: 15 })
  defaultSlotDuration: number;
}
