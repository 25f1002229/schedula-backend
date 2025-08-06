// src/appointments/dto/bulk-reschedule-appointments.dto.ts
import { IsArray, ArrayNotEmpty, IsInt, IsOptional } from 'class-validator';

export class BulkRescheduleAppointmentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  appointmentIds: number[];

  // Optional new slot to move all these appointments to
  @IsOptional()
  @IsInt()
  newSlotId?: number;
}
