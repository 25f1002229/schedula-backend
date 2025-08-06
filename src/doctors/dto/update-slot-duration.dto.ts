import { IsNumber, IsPositive } from 'class-validator';

export class UpdateSlotDurationDto {
  @IsNumber()
  @IsPositive()
  slotId: number;

  @IsNumber()
  @IsPositive()
  newDuration: number; // in minutes
}
