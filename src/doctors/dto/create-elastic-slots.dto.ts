// src/doctors/dto/create-elastic-slots.dto.ts
import { IsInt, Min, IsString, IsDateString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum SlotMode {
  STREAM = 'stream',
  WAVE = 'wave',
}

export class CreateElasticSlotsDto {
  @IsDateString()
  date: string;

  @IsInt()
  @Min(5) // reasonable minimum
  slotDuration: number; // in minutes — fixed duration for all slots

  @IsInt()
  availabilityId: number;

  @IsEnum(SlotMode)
  mode: SlotMode;

  @IsOptional()
  @IsNumber()
  maxBookings?: number;
}