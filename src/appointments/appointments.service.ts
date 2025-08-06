import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,In } from 'typeorm';

import { Appointment, PatientType  } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Doctor } from '../doctors/entities/doctor.entity';
import {
  DoctorTimeslot,
  SlotMode,
} from '../doctors/entities/doctor-timeslot.entity';
import { Patient } from '../patients/entities/patient.entity';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { BulkRescheduleMultipleDto } from './dto/bulk-reschedule-multiple.dto';
import { formatTime, parseTime } from '../utils/time-utils';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly repo: Repository<Appointment>,

    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,

    @InjectRepository(DoctorTimeslot)
    private readonly slotRepo: Repository<DoctorTimeslot>,

    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
  ) {}

  /** Book an appointment (with or without specific slot) */
  async book({
    doctorId,
    slotId,
    reason,
    patientId,
    confirmLater,
    requestedWindow,
    patientType,
  }: {
    doctorId: number;
    slotId?: number;
    reason?: string;
    patientId: number;
    confirmLater?: boolean;
    requestedWindow?: {
      date: string;
      partOfDay?: 'morning' | 'afternoon' | 'evening';
      urgent?: boolean;
    };
    patientType?: 'new' | 'follow_up';
  }) {
    const patient = await this.patientRepo.findOne({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const doctor = await this.doctorRepo.findOneBy({ id: doctorId });
    if (!doctor) throw new NotFoundException('Doctor not found');

    let slot: DoctorTimeslot | null = null;

    if (slotId) {
      slot = await this.slotRepo.findOne({
        where: { id: slotId, doctorId: doctorId },
        relations: ['appointments'],
      });

      if (!slot) throw new NotFoundException('Slot not found');

      const alreadyBooked = slot.appointments.length;

      if (slot.mode === SlotMode.STREAM && alreadyBooked >= 1) {
        throw new ConflictException('This stream slot is already booked');
      }

      if (
        slot.mode === SlotMode.WAVE &&
        slot.maxBookings &&
        alreadyBooked >= slot.maxBookings
      ) {
        throw new ConflictException('All wave slots are fully booked');
      }
    }

    const appointment = this.repo.create({
    patient,
    doctor,
    slot: slot ?? null,
    reason,
    status: confirmLater ? 'pending' : 'confirmed',
    confirmLater: !!confirmLater,
    requestedWindow: confirmLater ? requestedWindow ?? null : null,
    patientType: (patientType as PatientType) ?? PatientType.NEW
  });


    return this.repo.save(appointment);
  }

  /** Get all appointments for a patient */
  async getForPatient(patientId: number) {
    return this.repo.find({
      where: { patient: { id: patientId } },
      relations: ['doctor', 'slot'],
    });
  }

  /** Get all appointments for a doctor */
  async getForDoctor(doctorId: number) {
    return this.repo.find({
      where: { doctorId: doctorId },
      relations: ['patient', 'slot'],
    });
  }

  /** Reschedule an appointment */
  async reschedule(appointmentId: number, dto: RescheduleAppointmentDto) {
    const { newSlotId, confirmLater, requestedWindow } = dto;

    const appointment = await this.repo.findOne({
      where: { id: appointmentId },
      relations: ['slot', 'doctor', 'patient'],
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (newSlotId) {
      const newSlot = await this.slotRepo.findOne({
        where: {
          id: newSlotId,
          doctorId: appointment.doctor.id,
        },
        relations: ['appointments'],
      });

      if (!newSlot) throw new NotFoundException('New slot not found');

      if (
        newSlot.mode === SlotMode.STREAM &&
        newSlot.appointments.length >= 1
      ) {
        throw new ConflictException('Slot is already taken (stream)');
      }

      if (
        newSlot.mode === SlotMode.WAVE &&
        newSlot.maxBookings &&
        newSlot.appointments.length >= newSlot.maxBookings
      ) {
        throw new ConflictException('Slot is full (wave)');
      }

      appointment.slot = newSlot;
      appointment.status = 'confirmed';
      appointment.confirmLater = false;
      appointment.requestedWindow = null;
    } else {
      appointment.slot = null;
      appointment.status = 'pending';
      appointment.confirmLater = confirmLater ?? true;
      appointment.requestedWindow = requestedWindow ?? null;
    }

    return this.repo.save(appointment);
  }

  /** Cancel an appointment */
  async cancel(id: number, dto?: CancelAppointmentDto) {
  const appointment = await this.repo.findOne({ where: { id } });
  if (!appointment) {
    throw new NotFoundException('Appointment not found');
  }

  appointment.status = 'cancelled'; // or your app’s cancelled status string
  if (dto?.cancellationReason) {
    appointment.cancellationReason = dto.cancellationReason;
  }

  await this.repo.save(appointment);

  return { message: 'Appointment canceled successfully' };
}


  /** View one appointment */
  async getAppointmentById(id: number) {
    const appointment = await this.repo.findOne({
      where: { id },
      relations: ['doctor', 'patient', 'slot'],
    });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }
    return appointment;
  }

  async bulkCancelAppointments(appointmentIds: number[]) {
    const appointments = await this.repo.findBy({ id: In(appointmentIds) });
    if (appointments.length !== appointmentIds.length) {
      throw new NotFoundException('One or more appointments not found');
    }

    // Mark appointments status as 'cancelled' or delete depending on your business logic
    await this.repo.update({ id: In(appointmentIds) }, { status: 'cancelled' });

    return {
      message: `${appointmentIds.length} appointment(s) cancelled successfully.`,
    };
  }

  // Bulk reschedule appointments – all to one new slot
  async bulkRescheduleAppointments(appointmentIds: number[], newSlotId?: number) {
    // Fetch appointments
    const appointments = await this.repo.find({
      where: { id: In(appointmentIds)},
      relations: ['slot', 'doctor'],
    });
    if (appointments.length !== appointmentIds.length) {
      throw new NotFoundException('One or more appointments not found');
    }

    let newSlot: DoctorTimeslot | null = null;
    if (newSlotId) {
      newSlot = await this.slotRepo.findOne({
        where: { id: newSlotId },
        relations: ['appointments'],
      });
      if (!newSlot) throw new NotFoundException('New slot not found');

      // Check booking conflicts based on slot mode
      const bookedCount = newSlot.appointments.length;
      if (newSlot.mode === SlotMode.STREAM && bookedCount >= 1) {
      throw new ConflictException('New slot is already fully booked (stream)');
      }

      if (newSlot.mode === SlotMode.WAVE && newSlot.maxBookings && (bookedCount + appointmentIds.length) > newSlot.maxBookings) {
      throw new ConflictException('New slot does not have enough capacity for all rescheduled appointments');
      }
    }

    // Update all appointments
    for (const appointment of appointments) {
      appointment.slot = newSlot ?? null;
      appointment.status = newSlot ? 'confirmed' : 'pending';
      appointment.confirmLater = !newSlot;
      appointment.requestedWindow = !newSlot ? appointment.requestedWindow ?? null : null;
    }

    await this.repo.save(appointments);

    return {
      message: `${appointmentIds.length} appointment(s) rescheduled successfully${newSlot ? ` to slot ${newSlot.id}` : ' with pending status (no slot chosen)'}.`,
    };
  }

  // Bulk reschedule appointments – all to multiple new slot
  async bulkRescheduleMultiple(dto: BulkRescheduleMultipleDto) {
    const { reschedule } = dto;
    const appointmentIds = reschedule.map((m) => m.appointmentId);
    const slotIds = reschedule.map((m) => m.newSlotId);

    // Fetch all appointments
    const appointments = await this.repo.find({
      where: { id: In(appointmentIds) },
      relations: ['slot'],
    });
    if (appointments.length !== appointmentIds.length) {
      throw new NotFoundException('One or more appointments not found');
    }

    // Fetch all new slots
    const slots = await this.slotRepo.find({
      where: { id: In(slotIds) },
      relations: ['appointments', 'doctor'],
    });
    if (slots.length !== new Set(slotIds).size) {
      throw new NotFoundException('One or more target slots not found');
    }

    // Map slots by id for quick lookup
    const slotsById = new Map<number, DoctorTimeslot>();
    slots.forEach((slot) => slotsById.set(slot.id, slot));

    // Map appointments by id for quick lookup
    const appointmentsById = new Map<number, Appointment>();
    appointments.forEach((appt) => appointmentsById.set(appt.id, appt));

    // Track slot booking counts (simulate post-update)
    const slotBookingCounts = new Map<number, number>();
    slots.forEach((slot) => slotBookingCounts.set(slot.id, slot.appointments.length));

    // Validate each appointment->slot mapping
    for (const { appointmentId, newSlotId } of reschedule) {
      const appointment = appointmentsById.get(appointmentId);
      const newSlot = slotsById.get(newSlotId);

      if (!appointment || !newSlot) {
        throw new NotFoundException(`Invalid mapping for appointment ${appointmentId} or slot ${newSlotId}`);
      }

      // Check if new slot belongs to same doctor as original appointment slot
      if (appointment.slot && newSlot.doctor.id !== appointment.slot.doctor.id) {
        throw new BadRequestException(`Slot ${newSlotId} does not belong to the same doctor as appointment ${appointmentId}`);
      }

      const currentCount = slotBookingCounts.get(newSlotId) ?? 0;

      // Check capacity depending on mode
      if (newSlot.mode === SlotMode.STREAM) {
        // Stream slot allows only 1 booking
        if (currentCount >= 1) {
          throw new ConflictException(`Slot ${newSlotId} is already fully booked for stream mode`);
        }
      } else if (newSlot.mode === SlotMode.WAVE) {
        if (newSlot.maxBookings === null || newSlot.maxBookings === undefined) {
          throw new BadRequestException(`Slot ${newSlotId} wave mode missing maxBookings`);
        }
        // Check if capacity will be exceeded after reschedule
        if (currentCount + 1 > newSlot.maxBookings) {
          throw new ConflictException(`Slot ${newSlotId} does not have enough capacity for appointment ${appointmentId}`);
        }
      } else {
        throw new BadRequestException(`Unknown slot mode ${newSlot.mode} for slot ${newSlotId}`);
      }

      // Increment simulated booking count for this slot after this appointment is allocated to it
      slotBookingCounts.set(newSlotId, currentCount + 1);
    }

    // All validations passed, time to update appointments
    const updatedAppointments: Appointment[] = [];

    for (const { appointmentId, newSlotId } of reschedule) {
      const appointment = appointmentsById.get(appointmentId);
      const newSlot = slotsById.get(newSlotId);

      if (!appointment || !newSlot) {
      throw new NotFoundException(`Invalid mapping for appointment ${appointmentId} or slot ${newSlotId}`);
      }

      appointment.slot = newSlot;
      appointment.status = 'confirmed';
      appointment.confirmLater = false;
      // Optionally, clear/change requestedWindow, patientType etc. if your app uses them

      updatedAppointments.push(appointment);
    }

    await this.repo.save(updatedAppointments);

    return {
      message: `${updatedAppointments.length} appointment(s) rescheduled successfully to their new slots.`,
    };
  }

  async shrinkStreamSlotsAndRedistribute(
  doctorId: number,
  date: string,
  newStart: string,
  newEnd: string,
  minDuration = 5,
) {
  // 1. Fetch all stream slots for the doctor and date, ordered by startTime ascending
  const slots = await this.slotRepo.find({
    where: { doctorId, date, mode: SlotMode.STREAM },
    relations: ['appointments'],
    order: { startTime: 'ASC' },
  });

  // 2. Aggregate all appointments booked in these slots
  const appointments: Appointment[] = slots.flatMap(slot => slot.appointments);

  if (appointments.length === 0) {
    return { message: 'No appointments to redistribute.' };
  }

  // 3. Convert new start/end times to minutes and calculate total window in minutes
  const windowStartMin = parseTime(newStart);
  const windowEndMin = parseTime(newEnd);
  const windowDuration = windowEndMin - windowStartMin;

  if (windowDuration < minDuration) {
    throw new BadRequestException('Availability window is too small.');
  }

  // 4. Calculate initial slot duration based on number of appointments and window size
  const slotCount = appointments.length;
  let slotDuration = Math.floor(windowDuration / slotCount);
  if (slotDuration < minDuration) {
    slotDuration = minDuration; // enforce minimum slot duration
  }

  // 5. Calculate maximum appointments that fit with this slotDuration
  const maxAppointmentsFit = Math.floor(windowDuration / slotDuration);
  if (maxAppointmentsFit === 0) {
    throw new ConflictException('Availability too small to accommodate any appointment.');
  }

  // 6. Start transaction for atomicity of slot deletion, creation and appointment updates
  return await this.repo.manager.transaction(async manager => {
  // a1) Get all old slot IDs to delete
  const slotIds = slots.map(s => s.id);

  if (slotIds.length > 0) {
    // a2) Unassign or update all appointments linked to these slots first
    // Option 1: Set appointments.slot = null (if allowed and appropriate)
    await manager.update(
      Appointment,
      { slot: In(slotIds) },
      { slot: null },
    );

    // Alternatively, if you want to handle reassignment here, do it before deleting slots

    // a3) Now delete old slots safely (no FK conflicts)
    await manager.delete(DoctorTimeslot, { id: In(slotIds) });
  }

    // b) Create new stream slots with calculated slotDuration
    const newSlots: DoctorTimeslot[] = [];
    let curStart = windowStartMin;
    for (let i = 0; i < maxAppointmentsFit; i++) {
      if (curStart + slotDuration > windowEndMin + 0.1) break;

      const curEnd = Math.min(curStart + slotDuration, windowEndMin);

      newSlots.push(
        manager.create(DoctorTimeslot, {
          doctorId,
          date,
          startTime: formatTime(curStart),
          endTime: formatTime(curEnd),
          slotDuration: curEnd - curStart,
          mode: SlotMode.STREAM,
          maxBookings: 1,
          status: 'available',
          appointments: [],
        }),
      );
      curStart += slotDuration;
    }
    await manager.save(newSlots);

    // c) Sort appointments explicitly by creation time (booking order)
    appointments.sort((a, b) => (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0));

    // d) Assign appointments to new slots in booking order until slots run out
    const redistributableAppointments = appointments.slice(0, maxAppointmentsFit);
    const unassignedAppointments = appointments.slice(maxAppointmentsFit);

    for (let i = 0; i < redistributableAppointments.length; i++) {
      redistributableAppointments[i].slot = newSlots[i];
      redistributableAppointments[i].status = 'confirmed';
      // Optionally reset or update other appointment fields here
    }

    // Save updated appointments
    await manager.save(redistributableAppointments);

    // e) Return details including manual rescheduling info for overflow
    return {
      message: `${redistributableAppointments.length} appointments redistributed into new stream slots. ${
        unassignedAppointments.length
          ? unassignedAppointments.length + ' appointment(s) require manual rescheduling.'
          : ''
      }`,
      reassignedCount: redistributableAppointments.length,
      manualRescheduleCount: unassignedAppointments.length,
      manualRescheduleAppointmentIds: unassignedAppointments.map(a => a.id),
    };
  });
  }
}
