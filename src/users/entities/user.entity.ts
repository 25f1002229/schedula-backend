import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { Patient } from '../../patients/entities/patient.entity';

export enum UserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column()
  name: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @OneToOne(() => Doctor, doctor => doctor.user)
  doctorProfile: Doctor;
  
  @OneToOne(() => Patient, patient => patient.user)
  patientProfile: Patient;

}
