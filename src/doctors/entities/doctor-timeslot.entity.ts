import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { DoctorAvailability } from './doctor-availability.entity';

export enum SlotMode {
  STREAM = 'stream',
  WAVE = 'wave',
}

export type SlotStatus = 'available' | 'booked' | 'cancelled';

@Entity()
export class DoctorTimeslot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string; // YYYY-MM-DD

  @Column()
  startTime: string; // HH:MM

  @Column()
  endTime: string; // HH:MM

  @Column({ type: 'enum', enum: SlotMode })
  mode: SlotMode;

  @Column({ type: 'int', nullable: true })
  maxBookings: number | null;

  @ManyToOne(() => Doctor, doctor => doctor.timeslots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'doctorId' })
  doctor: Doctor;


  @Column()
  doctorId: number;

  @OneToMany(() => Appointment, appointment => appointment.slot)
  appointments: Appointment[];

  @Column({ type: 'int' })
  slotDuration: number;

  @Column({ type: 'enum', enum: ['available', 'booked', 'cancelled'], default: 'available' })
  status: SlotStatus;

  @ManyToOne(() => DoctorAvailability, availability => availability.timeslots, { nullable: true })
  @JoinColumn({ name: 'availabilityId' })
  availability?: DoctorAvailability;

  @Column({ nullable: true })
  availabilityId?: number;
}

