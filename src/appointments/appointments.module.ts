// src/appointments/appointments.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Doctor } from '../doctors/entities/doctor.entity';
import { Patient } from '../patients/entities/patient.entity';
import { DoctorTimeslot } from '../doctors/entities/doctor-timeslot.entity';
import { AuthModule } from '../auth/auth.module'; // Needed for JwtGuard via Passport

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Doctor,
      Patient,
      DoctorTimeslot, // ← slot relation
    ]),
    AuthModule, // ← for JWT guard and @Request() user
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
})
export class AppointmentsModule {}
