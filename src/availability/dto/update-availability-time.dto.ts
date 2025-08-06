import { IsString, IsInt, IsDateString } from 'class-validator';

export class UpdateAvailabilityTimeDto {
  @IsInt() availabilityId: number;

  @IsString() sessionDate: string; // e.g. "2025-08-05"

  @IsString() newStartTime: string; // e.g. "06:00"

  @IsString() newEndTime: string;   // e.g. "08:00"
}
