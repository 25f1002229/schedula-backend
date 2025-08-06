// src/doctors/dto/update-max-bookings.dto.ts
import { IsInt, Min } from 'class-validator';

export class UpdateMaxBookingsDto {
  @IsInt()
  slotId: number;

  @IsInt()
  @Min(1, { message: 'maxBookings must be at least 1' })
  newMaxBookings: number;
}
