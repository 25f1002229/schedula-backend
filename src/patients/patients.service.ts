import {
  BadRequestException,
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { Repository } from 'typeorm';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createProfile(userId: number, dto: CreatePatientProfileDto) {
      const existing = await this.patientRepo.findOne({ where: { userId } });
      if (existing) {
        throw new BadRequestException('Patient profile already exists.');
      }

      const patient = this.patientRepo.create({
        ...dto,
        userId,
      });

      return this.patientRepo.save(patient);
    }

  async findById(id: number) {
    const patient = await this.patientRepo.find({
      where: { id },
      relations: ['appointments', 'appointments.slot'],
    });

    if (!patient) throw new NotFoundException('Patient not found');
    return patient;
  }

  async update(id: number, dto: Partial<CreatePatientProfileDto>) {
    const patient = await this.patientRepo.findOne({ where: { id } });
    if (!patient) throw new NotFoundException('Patient not found');

    Object.assign(patient, dto);
    return this.patientRepo.save(patient);
  }
}
