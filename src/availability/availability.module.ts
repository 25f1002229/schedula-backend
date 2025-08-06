import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { DoctorTimeslot } from '../doctors/entities/doctor-timeslot.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorAvailability, DoctorTimeslot, Doctor])
    // Add per-date override entity here if using one
  ],
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
