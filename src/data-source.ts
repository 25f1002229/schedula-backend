// src/data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load env variables
dotenv.config();

// Entities
import { User } from './users/entities/user.entity';
import { Patient } from './patients/entities/patient.entity';
import { Doctor } from './doctors/entities/doctor.entity';
import { DoctorAvailability } from './doctors/entities/doctor-availability.entity';
import { DoctorTimeslot } from './doctors/entities/doctor-timeslot.entity';
import { Appointment } from './appointments/entities/appointment.entity';

// Migrations will be loaded from files
export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: false, // Always false in production
  logging: true,
  entities: [
    User,
    Patient,
    Doctor,
    DoctorAvailability,
    DoctorTimeslot,
    Appointment,
  ],
  migrations: ['src/migrations/*.ts'], // Correct glob pattern for your manual migration
  migrationsTableName: 'migrations',
});
