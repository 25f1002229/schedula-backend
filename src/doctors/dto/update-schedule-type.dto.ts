import { IsInt, IsIn, IsOptional, IsNumber } from 'class-validator';

export class UpdateScheduleTypeDto {
  @IsInt()
  slotId: number;
  
  @IsIn(['stream', 'wave'])
  newMode: 'stream' | 'wave';

  @IsOptional()
  @IsNumber()
  maxBookings?: number;
}
