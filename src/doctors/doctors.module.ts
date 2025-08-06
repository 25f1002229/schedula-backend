import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { Doctor } from './entities/doctor.entity';
import { DoctorTimeslot } from './entities/doctor-timeslot.entity';
import { DoctorAvailability } from './entities/doctor-availability.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Doctor, DoctorTimeslot, DoctorAvailability])],
  providers: [DoctorsService],
  controllers: [DoctorsController],
  exports: [DoctorsService],
})
export class DoctorsModule {}
