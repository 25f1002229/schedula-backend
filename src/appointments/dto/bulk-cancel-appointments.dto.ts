// src/appointments/dto/bulk-cancel-appointments.dto.ts
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class BulkCancelAppointmentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  appointmentIds: number[];
}
