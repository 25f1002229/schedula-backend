import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';  // import User entity
import { DoctorTimeslot } from './doctor-timeslot.entity';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { DoctorAvailability } from './doctor-availability.entity';

@Entity()
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  specialty: string;

  @Column({ nullable: true })
  qualifications?: string;

  @Column()
  experienceYears: number;
  @ManyToOne(() => User, user => user.doctorProfile, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @OneToMany(() => DoctorTimeslot, slot => slot.doctor)
  timeslots: DoctorTimeslot[];

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  appointments: Appointment[];

  @OneToMany(() => DoctorAvailability, availability => availability.doctor)
  availabilities: DoctorAvailability[];
}
