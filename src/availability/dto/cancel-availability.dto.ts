// src/availability/dto/cancel-availability.dto.ts

import { IsInt, Min } from 'class-validator';

export class CancelAvailabilityDto {
  @IsInt()
  @Min(1)
  availabilityId: number;

  @IsInt()
  @Min(1)
  doctorId: number; // Optional, if you want to explicitly require doctor identification
}
