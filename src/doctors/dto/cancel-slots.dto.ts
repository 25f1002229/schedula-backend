// src/doctors/dto/cancel-slots.dto.ts
import { IsArray, ArrayNotEmpty, IsInt, Min } from 'class-validator';

export class CancelSlotsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  slotIds: number[];
}
