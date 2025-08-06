import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException
} from '@nestjs/common';
import { MoreThanOrEqual } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { Doctor } from '../doctors/entities/doctor.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityTimeDto } from './dto/update-availability-time.dto';
import { DoctorTimeslot } from 'src/doctors/entities/doctor-timeslot.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(DoctorAvailability)
    private readonly availabilityRepo: Repository<DoctorAvailability>,

    @InjectRepository(DoctorTimeslot)
    private readonly timeslotRepo: Repository<DoctorTimeslot>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    // If you track per-date session overrides in a separate entity, inject its repo here
  ) {}

  // Create weekly availability pattern
  async create(doctorId: number, dto: CreateAvailabilityDto) {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    // Uniqueness: only one record per weekday per doctor
    const exists = await this.availabilityRepo.findOne({
      where: { doctorId: doctorId, dayOfWeek: dto.dayOfWeek },
    });
    if (exists) {
      throw new ConflictException('Availability for this weekday already exists');
    }

    const availability = this.availabilityRepo.create({ ...dto, doctor });

    return this.availabilityRepo.save(availability);
  }

  // List all availabilities for a doctor
  async findAllForDoctor(doctorId: number) {
    return this.availabilityRepo.find({
      where: { doctorId: doctorId },
      relations: ['doctor'],
      order: { dayOfWeek: 'ASC' }
    });
  }

  async updateAvailabilityTime(
  doctorId: number,
  dto: UpdateAvailabilityTimeDto,
): Promise<{ message: string; cancelledSlotsCount: number }> {
  const { availabilityId, sessionDate, newStartTime, newEndTime } = dto;

  // Helper to normalize and parse "HH:mm" time string into total minutes
  function timeStrToMinutes(timeStr: string): number {
    if (!timeStr) return NaN;
    const trimmed = timeStr.trim();
    const parts = trimmed.split(':');
    if (parts.length !== 2) return NaN;
    const h = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const hours = Number(h);
    const minutes = Number(m);
    if (isNaN(hours) || isNaN(minutes)) return NaN;
    return hours * 60 + minutes;
  }

  const newStartMinutes = timeStrToMinutes(newStartTime);
  const newEndMinutes = timeStrToMinutes(newEndTime);

  if (isNaN(newStartMinutes) || isNaN(newEndMinutes)) {
    throw new BadRequestException('Invalid newStartTime or newEndTime format.');
  }

  if (newEndMinutes <= newStartMinutes) {
    throw new BadRequestException('newEndTime must be after newStartTime.');
  }

  // Run all DB operations inside a transaction for atomicity
  return await this.timeslotRepo.manager.transaction(async transactionalEntityManager => {
    // Fetch slots filtering only by doctorId and date
    // Remove filtering on availabilityId to match slots even if availabilityId is null
    const slots: DoctorTimeslot[] = await transactionalEntityManager
      .createQueryBuilder(DoctorTimeslot, 'slot')
      .leftJoinAndSelect('slot.appointments', 'appointments')
      .where('slot.doctorId = :doctorId', { doctorId })
      .andWhere('slot.date = :date', { date: sessionDate })
      .getMany();

    console.log('Fetched slots:', slots.map(slot => ({
      id: slot.id,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: slot.status,
      appointmentsCount: slot.appointments.length,
    })));

    // Check for any booked slots outside the new window to prevent shrinking
    const conflictingBookedSlots = slots.filter(slot => {
      const start = timeStrToMinutes(slot.startTime);
      const end = timeStrToMinutes(slot.endTime);
      const outsideWindow = start < newStartMinutes || end > newEndMinutes;

      const hasActiveBooking = slot.appointments.some(
        appt => appt.status !== 'cancelled' && appt.status !== 'no_show',
      );

      return outsideWindow && hasActiveBooking;
    });

    if (conflictingBookedSlots.length > 0) {
      const ids = conflictingBookedSlots.map(s => s.id);
      console.warn(`Conflicting booked slots outside new time: ${ids.join(', ')}`);
      throw new ConflictException(
        'Cannot shrink session window; there are active booked slots outside the new time range.',
      );
    }

    // Identify unbooked slots outside new window to cancel
    const slotsToCancel = slots.filter(slot => {
      const start = timeStrToMinutes(slot.startTime);
      const end = timeStrToMinutes(slot.endTime);
      const outsideWindow = start < newStartMinutes || end > newEndMinutes;
      const isUnbooked = slot.appointments.length === 0;

      if (outsideWindow && isUnbooked) {
        console.log(`Will cancel slot ID ${slot.id} (${slot.startTime}-${slot.endTime})`);
      }

      return outsideWindow && isUnbooked;
    });

    if (slotsToCancel.length > 0) {
      const idsToCancel = slotsToCancel.map(s => s.id);
      await transactionalEntityManager
        .createQueryBuilder()
        .update(DoctorTimeslot)
        .set({ status: 'cancelled' })
        .whereInIds(idsToCancel)
        .execute();

      console.log(`Cancelled ${idsToCancel.length} slots.`);
    } else {
      console.log('No unbooked slots to cancel outside the new window.');
    }

    // Optionally update availability override or related entities here

    return {
      message: `Session for ${sessionDate} resized to ${newStartTime}–${newEndTime} successfully.`,
      cancelledSlotsCount: slotsToCancel.length,
    };
  });
  }



  // [Optional] Get all per-date overrides
  async getSessionOverrides(
    doctorId: number,
    from?: string,
    to?: string,
  ) {
    // Implement based on how you store session overrides
    // Here, just a stub
    return [];
  }

  async deleteAvailability(doctorId: number, availabilityId: number) {
  const availability = await this.availabilityRepo.findOne({
    where: {
      id: availabilityId,
      doctorId: doctorId,
    },
  });

  if (!availability) {
    throw new NotFoundException('Availability not found for the doctor.');
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  await this.availabilityRepo.manager.transaction(async transactionalEntityManager => {
    await transactionalEntityManager
      .createQueryBuilder()
      .update(DoctorTimeslot)
      .set({ status: 'cancelled' })
      .where('"doctorId" = :doctorId', { doctorId })
      .andWhere('"availabilityId" = :availabilityId', { availabilityId })
      .andWhere('date >= :today', { today: todayStr })
      .execute();

    await transactionalEntityManager.remove(DoctorAvailability, availability);
  });

  return { message: `Availability for ${availability.dayOfWeek} deleted successfully.` };
}
}
