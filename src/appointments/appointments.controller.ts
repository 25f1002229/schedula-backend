import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { BulkCancelAppointmentsDto } from './dto/bulk-cancel-appointments.dto';
import { BulkRescheduleAppointmentsDto } from './dto/bulk-reschedule-appointments.dto';
import { BulkRescheduleMultipleDto } from './dto/bulk-reschedule-multiple.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentService: AppointmentsService) {}

  /**
   * 1. Book appointment
   * - Can include slotId (specific slot) OR
   * - confirmLater + requestedWindow (e.g. "any morning slot")
   */
  @Post()
  bookAppointment(
    @Request() req,
    @Body() dto: CreateAppointmentDto,
  ) {
    const patientId = req.user.sub; // or req.user.id if using custom claim
    return this.appointmentService.book({
      ...dto,
      patientId,
    });
  }

  /**
   * 2. Get appointments by patient ID
   */
  @Get('patient/:id')
  getPatientAppointments(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.getForPatient(id);
  }

  /**
   * 3. Get appointments by doctor ID
   */
  @Get('doctor/:id')
  getDoctorAppointments(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.getForDoctor(id);
  }

  /**
   * 4. Reschedule appointment
   * - Allows either newSlotId (specific slot) OR confirmLater: true + requestedWindow
   */
  @Patch(':id/reschedule')
  rescheduleAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    // Append appointmentId to DTO
    return this.appointmentService.reschedule(id, dto);
  }

  // Cancel with optional body
  @Delete(':id')
  cancelAppointment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto?: CancelAppointmentDto,
  ) {
    return this.appointmentService.cancel(id, dto);
  }

  /**
   * 6. View appointment by ID (optional use)
   */
  @Get(':id')
  getAppointment(@Param('id', ParseIntPipe) id: number) {
    return this.appointmentService.getAppointmentById(id);
  }

  // Bulk cancel endpoint
  @Post('bulk-cancel')
  async bulkCancel(@Body() dto: BulkCancelAppointmentsDto) {
    return this.appointmentService.bulkCancelAppointments(dto.appointmentIds);
  }

  // Bulk reschedule endpoint
  @Patch('bulk-reschedule')
  async bulkRescheduleSingle(@Body() dto: BulkRescheduleAppointmentsDto) {
    return this.appointmentService.bulkRescheduleAppointments(dto.appointmentIds, dto.newSlotId);
  }

  @Patch('bulk-reschedule/multiple')
  async bulkRescheduleMultiple(@Body() dto: BulkRescheduleMultipleDto) {
  return this.appointmentService.bulkRescheduleMultiple(dto);
  }

  @Patch('shrink-slots')
  async shrinkAndRedistributeSlots(@Body() body: {
    doctorId: number;
    date: string;
    newStart: string;
    newEnd: string;
  }) {
    // Optionally add DTO validation here
    return this.appointmentService.shrinkStreamSlotsAndRedistribute(
      body.doctorId,
      body.date,
      body.newStart,
      body.newEnd,
      5, // min duration
    );
  }
}