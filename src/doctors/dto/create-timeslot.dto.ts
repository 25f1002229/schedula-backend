import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum SlotMode {
  STREAM = 'stream',
  WAVE = 'wave',
}

export class CreateTimeslotDto {
  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsEnum(SlotMode)
  mode: SlotMode;

  @IsOptional()
  @IsNumber()
  maxBookings?: number;
}
