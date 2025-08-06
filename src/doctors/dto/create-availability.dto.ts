import { IsString, IsArray } from 'class-validator';

export class CreateAvailabilityDto {
  @IsString()
  dayOfWeek: string;

  @IsArray()
  timeSlots: { startTime: string; endTime: string }[];
}
