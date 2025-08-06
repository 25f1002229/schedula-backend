// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelloController } from './hello/hello.controller';

// Entities
import { User } from './users/entities/user.entity';
import { Doctor } from './doctors/entities/doctor.entity';
import { Patient } from './patients/entities/patient.entity';
import { Appointment } from './appointments/entities/appointment.entity';

// Feature modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AvailabilityModule } from './availability/availability.module';

@Module({
  imports: [
    // Global config for .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // TypeORM connection setup
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Doctor, Patient, Appointment],
      synchronize: false,
      autoLoadEntities: true,
    }),

    // Feature modules you must register so Nest knows about services/controllers
    AuthModule,
    UsersModule,
    DoctorsModule,
    PatientsModule,
    AppointmentsModule,
    AvailabilityModule,
  ],
  controllers: [AppController, HelloController, ],
  providers: [AppService],
})
export class AppModule {}
