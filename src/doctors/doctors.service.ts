import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Between } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThanOrEqual, In } from 'typeorm';

import { Doctor } from './entities/doctor.entity';
import { DoctorTimeslot, SlotMode, SlotStatus } from './entities/doctor-timeslot.entity';
import { DoctorAvailability } from './entities/doctor-availability.entity';

import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { CreateTimeslotDto } from './dto/create-timeslot.dto';
import { CreateElasticSlotsDto } from './dto/create-elastic-slots.dto';
import { UpdateSlotDurationDto } from './dto/update-slot-duration.dto';
import { UpdateTimeslotDto } from './dto/update-timeslot.dto'
import { CreateAvailabilityDto } from '../availability/dto/create-availability.dto';
import { formatTime, parseTime } from '../utils/time-utils';
import { getDatesForWeekdayInRange } from '../utils/date-utils';
import { UpdateAvailabilityTimeDto } from '../availability/dto/update-availability-time.dto';
import { UpdateMaxBookingsDto } from './dto/update-max-bookings.dto';

// Utility to parse "HH:mm" string to Date with same day but time set
function parseTimeToDate(date: Date, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, 0, 0);
  return newDate;
}

// Utility to calculate slotDuration in minutes
function getSlotDurationInMinutes(startTime: string, endTime: string): number {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  return (endH * 60 + endM) - (startH * 60 + startM);
}

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,

    @InjectRepository(DoctorTimeslot)
    private readonly timeslotRepo: Repository<DoctorTimeslot>,

    @InjectRepository(DoctorAvailability)
    private readonly availabilityRepo: Repository<DoctorAvailability>,
  ) {}

  private timeStrToMinutes(timeStr: string): number {
    const [hoursStr, minutesStr] = timeStr.trim().split(':');
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) {
      throw new BadRequestException(`Invalid time string: ${timeStr}`);
    }

    return hours * 60 + minutes;
  }

  getAll() {
    return this.doctorRepo.find();
  }

  getById(id: number) {
    return this.doctorRepo.findOne({ where: { id } });
  }
  
  getTimeslots(doctorId: number, dateStr?: string) {
  const whereCondition: any = {
    doctorId: doctorId,
  };

  if (dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date string');
    }
    // Use string directly or convert to 'YYYY-MM-DD'
    whereCondition.date = dateStr.slice(0, 10);
  }

  return this.timeslotRepo.find({
    where: whereCondition,
    relations: ['appointments'],
    order: {
      date: 'ASC',
      startTime: 'ASC',
    },
  });
}




  async createTimeslot(doctorId: number, dto: CreateTimeslotDto) {
    const doctor = await this.doctorRepo.findOne({ where: { id: doctorId } });
    if (!doctor) throw new NotFoundException('Doctor not found');

    if (dto.mode === SlotMode.WAVE && !dto.maxBookings) {
      throw new BadRequestException('maxBookings is required for WAVE mode');
    }

    const timeslot = this.timeslotRepo.create({
      ...dto,
      doctor,
    });

    return this.timeslotRepo.save(timeslot);
  }

  deleteSlot(slotId: number) {
    return this.timeslotRepo.delete(slotId);
  }

  async createProfile(userId: number, dto: CreateDoctorProfileDto) {
    const existing = await this.doctorRepo.findOne({ where: { userId } });
    if (existing) {
      throw new BadRequestException('Doctor profile already exists.');
    }

    const doctor = this.doctorRepo.create({
      ...dto,
      userId,
    });

    return this.doctorRepo.save(doctor);
  }

  async createAvailability(doctorId: number, dto: CreateAvailabilityDto) {
    const doctor = await this.doctorRepo.findOneBy({ id: doctorId });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const availability = this.availabilityRepo.create({
      ...dto,
      doctor,
    });

    return this.availabilityRepo.save(availability);
  }

  async generateElasticSlots(doctorId: number, dto: CreateElasticSlotsDto) {
  const availability = await this.availabilityRepo.findOne({
  where: {
    id: dto.availabilityId,
    doctorId: doctorId, // use doctorId FK column directly
  },
  });


  if (!availability) {
    throw new NotFoundException('Availability not found');
  }

  const { date, slotDuration, mode } = dto;

  const slots: DoctorTimeslot[] = [];

  // Helper functions to parse and format time strings as needed
  let current = parseTime(availability.startTime); // e.g. returns minutes from midnight or Date
  const end = parseTime(availability.endTime);

  while (current + slotDuration <= end) {
    const slot = this.timeslotRepo.create({
      doctorId: doctorId,
      availability, // better to assign relation as entity, not just id
      date,
      startTime: formatTime(current),
      endTime: formatTime(current + slotDuration),
      slotDuration,
      mode,
      status: 'available',
      maxBookings: mode === SlotMode.WAVE
      ? (dto.maxBookings ?? availability.maxBookings ?? 1)
      : null,
    });

    const saved = await this.timeslotRepo.save(slot);
    slots.push(saved);

    current += slotDuration;
  }

  return slots;
  }



  async updateSlotDuration(doctorId: number, slotId: number, newDuration: number) {
  const slot = await this.timeslotRepo.findOne({
    where: { id: slotId, doctorId: doctorId },
  });

  if (!slot) throw new NotFoundException('Slot not found');
  if (slot.status === 'booked') {
    throw new ConflictException('Cannot resize a booked slot');
  }

  const slotStart = parseTime(slot.startTime);
  const newEnd = slotStart + newDuration;

  // Fetch all next slots starting after current slot's start time but before new end time
  const nextSlots = await this.timeslotRepo.find({
    where: {
      doctorId: doctorId,
      date: slot.date,
      startTime: Between(slot.startTime, formatTime(newEnd)),
    },
    order: { startTime: 'ASC' },
  });

  for (const nextSlot of nextSlots) {
    if (nextSlot.status === 'booked') {
      throw new ConflictException('Slot duration overlaps with a booked next slot');
    }
  }

  // Delete or merge all overlapped next slots (since they are free)
  if (nextSlots.length > 0) {
    const idsToDelete = nextSlots.map(s => s.id);
    await this.timeslotRepo.delete(idsToDelete);
  }

  // Update current slot duration and endTime
  slot.slotDuration = newEnd - slotStart;
  slot.endTime = formatTime(newEnd);

  return this.timeslotRepo.save(slot);
  }


  async updateSlotMode(
    doctorId: number,
    slotId: number,
    newMode: 'stream' | 'wave',
    maxBookings?: number,
  ) {
    const slot = await this.timeslotRepo.findOne({
      where: { id: slotId, doctorId: doctorId },
    });

    if (!slot) throw new NotFoundException('Slot not found');

    if (newMode === 'wave' && (maxBookings === undefined || maxBookings <= 0)) {
      throw new BadRequestException('maxBookings required for wave mode');
    }

    if (newMode === 'stream') {
      slot.maxBookings = null;
    }

    slot.mode = newMode as SlotMode;
    if (newMode === 'wave') {
      slot.maxBookings = maxBookings ?? null;
    }

    return this.timeslotRepo.save(slot);
  }

  async updateTimeslot(doctorId: number, slotId: number, dto: UpdateTimeslotDto) {
  // Find by slotId AND doctorId together
  const slot = await this.timeslotRepo.findOne({ 
    where: { id: slotId, doctorId: doctorId },
    relations: ['appointments'],
  });
  if (!slot) {
    throw new NotFoundException(`Timeslot with ID ${slotId} not found for doctor ${doctorId}`);
  }

  if ((dto.startTime && !dto.endTime) || (!dto.startTime && dto.endTime)) {
    throw new BadRequestException('Both startTime and endTime must be provided when updating time.');
  }

  if (dto.startTime && dto.endTime && (dto.startTime !== slot.startTime || dto.endTime !== slot.endTime)) {
    const startMinutes = this.timeStrToMinutes(dto.startTime);
    const endMinutes = this.timeStrToMinutes(dto.endTime);

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('endTime must be after startTime');
    }

    // 1. Check for active appointments on this slot
    const hasActiveBookings = slot.appointments.some(
      appt => appt.status !== 'cancelled' && appt.status !== 'no_show',
    );
    if (hasActiveBookings) {
      throw new ConflictException(
        'Cannot change start or end time because the slot has active booked appointments.'
      );
    }

    // 2. Check for overlapping slots on the same date for the same doctor
    const overlappingSlots = await this.timeslotRepo
    .createQueryBuilder('slot')
    .where('slot.doctorId = :doctorId', { doctorId: slot.doctorId })
    .andWhere('slot.date = :date', { date: slot.date })
    .andWhere('slot.id != :id', { id: slot.id })
    .andWhere(
    'slot."startTime"::time < :newEndTime::time AND slot."endTime"::time > :newStartTime::time',
    { newEndTime: dto.endTime, newStartTime: dto.startTime }
    )
    .getCount();



    if (overlappingSlots > 0) {
      throw new ConflictException('New start and end time conflict with existing time slots.');
    }

    // Update times and duration
    slot.startTime = dto.startTime;
    slot.endTime = dto.endTime;
    slot.slotDuration = endMinutes - startMinutes;
  }

  // Update date if provided
  if (dto.date) {
    slot.date = dto.date;
  }

  await this.timeslotRepo.save(slot);

  return { message: 'Timeslot updated successfully', slot };
  }




  async batchMergeSlots(doctorId: number, slotIds: number[]) {
  if (!slotIds || slotIds.length < 2) {
    throw new BadRequestException('Provide at least two slot IDs to merge.');
  }

  // Use a transaction to guarantee atomic operation
  return await this.timeslotRepo.manager.transaction(async (manager) => {
    const slots = await manager.find(DoctorTimeslot, {
      where: { id: In(slotIds), doctorId: doctorId },
      relations: ['doctor', 'appointments'],
    });

    if (slots.length !== slotIds.length) {
      throw new NotFoundException('One or more slots not found.');
    }

    const doctor = slots[0].doctor;
    const date = slots[0].date;
    const mode = slots[0].mode;

    for (const slot of slots) {
      if (
        slot.doctor.id !== doctorId ||
        slot.date !== date ||
        slot.status !== 'available' ||
        slot.mode !== mode
      ) {
        throw new ConflictException('Slots must be available, on the same date, same doctor, and same mode.');
      }
    }

    slots.sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

    for (let i = 0; i < slots.length - 1; i++) {
      if (parseTime(slots[i].endTime) !== parseTime(slots[i + 1].startTime)) {
        throw new ConflictException('All slots must be consecutive with no gaps or overlaps.');
      }
    }

    // Create merged slot entity using the transactional manager
    const mergedSlot = manager.create(DoctorTimeslot, {
      doctor,
      date,
      startTime: slots[0].startTime,
      endTime: slots[slots.length - 1].endTime,
      slotDuration: parseTime(slots[slots.length - 1].endTime) - parseTime(slots[0].startTime),
      mode,
      status: 'available',
      maxBookings:
        mode === 'wave'
          ? slots.map((s) => s.maxBookings || 0).reduce((max, curr) => Math.max(max, curr), 0)
          : null,
    });

    const savedSlot = await manager.save(mergedSlot);

    // IMPORTANT: Before deleting slots, ensure no FK violation due to appointments
    // Optionally, check if appointments exist and decide what to do (cancel, reassign, etc.)
    for (const slot of slots) {
      // Optionally, throw if active appointments exist to avoid data loss
      if (slot.appointments.length > 0) {
        throw new ConflictException(
          `Cannot merge slot ${slot.id} because it has existing appointments.`,
        );
      }
    }

    await manager.delete(DoctorTimeslot, { id: In(slotIds) });

    return savedSlot;
  }).catch((error) => {
    // Log detailed error for diagnosis
    console.error('batchMergeSlots error:', error);
    throw error; // keep original exception for NestJS to handle
  });
  }


  async updateAvailabilityWindow(
  doctorId: number,
  dto: UpdateAvailabilityTimeDto,
) {
  const { availabilityId, sessionDate, newStartTime, newEndTime } = dto;

  const availability = await this.availabilityRepo.findOne({
    where: { id: availabilityId, doctorId: doctorId } ,
  });

  if (!availability) {
    throw new NotFoundException('Availability not found.');
  }

  // Fetch all slots for the given session date
  const dateSlots = await this.timeslotRepo.find({
    where: {
      doctorId: doctorId,
      date: sessionDate,
    },
    order: { startTime: 'ASC' },
  });

  const newStart = parseTime(newStartTime);
  const newEnd = parseTime(newEndTime);

  // Find affected slots outside new time window
  const slotsToDelete = dateSlots.filter(
    (slot) =>
      parseTime(slot.startTime) < newStart || parseTime(slot.endTime) > newEnd,
  );

  // Check if any of those are booked
  const hasBooked = slotsToDelete.find((slot) => slot.status === 'booked');
  if (hasBooked) {
    throw new ConflictException('Cannot shrink time — booked appointments exist.');
  }

  // Safe to delete/reschedule
  await Promise.all(
    slotsToDelete.map((slot) => this.timeslotRepo.delete(slot.id)),
  );

  return {
    message: `Session resized to ${newStartTime}–${newEndTime}. ${slotsToDelete.length} slot(s) deleted.`,
  };
  }

  async updateMaxBookings(doctorId: number, dto: UpdateMaxBookingsDto) {
  const { slotId, newMaxBookings } = dto;

  // Explicitly use 'doctorId' property on DoctorTimeslot entity, no nested object filter
  const slot = await this.timeslotRepo.findOne({
    where: {
      id: slotId,
      doctorId: doctorId,   // <-- must be 'doctorId', not nested object
    },
    relations: ['appointments', 'doctor'],
  });

  if (!slot) {
    throw new NotFoundException('Slot not found for doctor');
  }

  if (slot.mode !== SlotMode.WAVE) {
    throw new BadRequestException('Only wave mode slots support maxBookings update');
  }

  const currentBookingsCount = slot.appointments.length;

  if (newMaxBookings < currentBookingsCount) {
    throw new ConflictException(
      `Cannot reduce maxBookings below current booked patients (${currentBookingsCount})`
    );
  }

  const oldMax = slot.maxBookings;
  slot.maxBookings = newMaxBookings;

  await this.timeslotRepo.save(slot);

  return {
    message: `maxBookings updated from ${oldMax} to ${newMaxBookings} for slot ${slotId}`,
    slot,
  };
  }


  async getSlotWithDetails(doctorId: number, slotId: number) {
  const slot = await this.timeslotRepo.createQueryBuilder('slot')
    .leftJoinAndSelect('slot.appointments', 'appointments')
    .leftJoinAndSelect('slot.doctor', 'doctor')
    .where('slot.doctorId = :doctorId', { doctorId })
    .andWhere('slot.id = :slotId', { slotId })
    .getOne();

  if (!slot) {
    throw new NotFoundException('Slot not found for doctor');
  }

  return slot;
  }



  /**
   * Pre-generate all timeslots for all doctors' weekly availability templates
   * between startDate and endDate (inclusive).
   */
  async preGenerateFutureSlots(
    startDate: Date,
    endDate: Date,
    mode: SlotMode,
    doctorId: number,
    slotDuration?: number, 
    maxBookings?: number
    ): Promise<{ created: number; skipped: number }> {
    // 1) Load all doctor availabilities (weekly patterns)
    const allAvailabilities = await this.availabilityRepo.find({
      where: { doctorId: doctorId },
      relations: ['doctor'],
    });


    let createdCount = 0;
    let skippedCount = 0;

    for (const availability of allAvailabilities) {
      // Convert dayOfWeek string to number (0=Sunday, 1=Monday,...)
      // Adjust based on your usage, assuming "Monday" = 1, ... "Sunday"=7 or 0
      const dayOfWeekStrToNum = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const dayOfWeekNum = dayOfWeekStrToNum[availability.dayOfWeek];
      if (dayOfWeekNum === undefined) {
        console.warn(`Unknown dayOfWeek: ${availability.dayOfWeek} for availability ${availability.id}`);
        continue;
      }

      // 2) Get all dates matching availability dayOfWeek in range
      const datesToGenerate = getDatesForWeekdayInRange(startDate, endDate, dayOfWeekNum);

      for (const date of datesToGenerate) {
        // 3) Check if slots already generated for this doctor/date linked to this availability
        const existingSlots = await this.timeslotRepo.find({
          where: {
            doctorId: availability.doctor.id,
            date: date.toISOString().slice(0, 10),
            // Optionally, link slots via availabilityId or similar if you track
          },
        });

        if (existingSlots.length > 0) {
          // Slots exist, skip generation for this date
          skippedCount++;
          continue;
        }

        // 4) Generate slots for the date using availability settings
        const effectiveSlotDuration = slotDuration ?? availability.defaultSlotDuration;
        const slots = this.generateSlotsForDateAndAvailability(date, availability, effectiveSlotDuration, mode, maxBookings);


        // 5) Save the slots
        await this.timeslotRepo.save(slots);
        createdCount += slots.length;
      }
    }

    return { created: createdCount, skipped: skippedCount };
  }

  /**
   * Generates timeslots for a given date and availability pattern.
   */
  private generateSlotsForDateAndAvailability(
  date: Date,
  availability: DoctorAvailability,
  slotDurationMinutes?: number,
  mode: SlotMode = SlotMode.STREAM,
  maxBookings?: number,
): DoctorTimeslot[] {
  const slots: DoctorTimeslot[] = [];
  const dateStr = date.toISOString().slice(0, 10);
  const startDateTime = parseTimeToDate(date, availability.startTime);
  const endDateTime = parseTimeToDate(date, availability.endTime);
  const effectiveSlotDuration = slotDurationMinutes ?? availability.defaultSlotDuration;

  let currentStart = new Date(startDateTime);

  while (currentStart < endDateTime) {
    const currentEnd = new Date(currentStart.getTime() + effectiveSlotDuration * 60 * 1000);
    if (currentEnd > endDateTime) break;

    const slot = this.timeslotRepo.create({
      doctor: availability.doctor,
      date: dateStr,
      startTime: currentStart.toTimeString().slice(0, 5),
      endTime: currentEnd.toTimeString().slice(0, 5),
      slotDuration: slotDurationMinutes,
      mode,
      status: 'available',
      maxBookings: mode === SlotMode.WAVE
      ? (maxBookings ?? availability.maxBookings ?? 1)
      : null, // Add maxBookings property to availability or use default
    });

    slots.push(slot);
    currentStart = currentEnd;
  }

  return slots;
  }

  /**
   * Cancel multiple slots by slot IDs for a specific doctor.
   * Slots with booked appointments cannot be cancelled.
   */
  async cancelSlots(doctorId: number, slotIds: number[]): Promise<{ cancelledCount: number }> {
    // Fetch slots by IDs scoped to doctor
    const slots = await this.timeslotRepo.find({
      where: { id: In(slotIds), doctorId: doctorId },
      relations: ['appointments'],
    });

    if (slots.length !== slotIds.length) {
      throw new NotFoundException('One or more slots not found for this doctor');
    }

    // Check if any slot has booked appointments
    for (const slot of slots) {
      // Check if any appointment is not cancelled
      const hasActiveBooking = slot.appointments.some(
        appt => appt.status !== 'cancelled' && appt.status !== 'no_show'
      );
      if (hasActiveBooking) {
        throw new BadRequestException(
          `Slot with id ${slot.id} has existing booked appointments and cannot be cancelled.`
        );
      }
    }

    // Update slots status to 'cancelled'
    for (const slot of slots) {
      slot.status = 'cancelled'; // 'cancelled'
    }

    await this.timeslotRepo.save(slots);

    return { cancelledCount: slots.length };
  }
}