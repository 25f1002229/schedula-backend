import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { DoctorTimeslot } from '../../doctors/entities/doctor-timeslot.entity';

export enum PatientType {
  NEW = 'new',
  FOLLOW_UP = 'follow_up',
  // add more types if needed
}

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Patient, patient => patient.appointments)
  @JoinColumn()
  patient: Patient;

  @ManyToOne(() => Doctor, doctor => doctor.appointments)
  @JoinColumn()
  doctor: Doctor;

  @ManyToOne(() => DoctorTimeslot, { nullable: true })
  @JoinColumn()
  slot?: DoctorTimeslot | null; // 

  @Column()
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: 'confirmed' })
  status: 'pending' | 'confirmed' | 'no_show' | 'cancelled';

  @Column({ type: 'json', nullable: true })
  requestedWindow: {
    date: string;
    partOfDay?: 'morning' | 'afternoon' | 'evening';
    urgent?: boolean;
  } | null;

  @Column({ default: false })
  confirmLater: boolean;

  @Column({ type: 'enum', enum: PatientType, default: PatientType.NEW })
  patientType: PatientType;
  
  @Column()
  doctorId: number;

  @Column({ type: 'text', nullable: true })
  cancellationReason?: string;
}
