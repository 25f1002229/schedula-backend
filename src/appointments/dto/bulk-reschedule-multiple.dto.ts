// src/appointments/dto/bulk-reschedule-multiple.dto.ts
import { IsArray, ArrayNotEmpty, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class AppointmentReschedulePair {
  @IsInt()
  @Min(1)
  appointmentId: number;

  @IsInt()
  @Min(1)
  newSlotId: number;
}

export class BulkRescheduleMultipleDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => AppointmentReschedulePair)
  reschedule: AppointmentReschedulePair[];
}
