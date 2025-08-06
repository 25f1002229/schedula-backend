// src/doctors/dto/batch-merge-slots.dto.ts
import { IsArray, ArrayMinSize, IsNumber } from 'class-validator';

export class BatchMergeSlotsDto {
  @IsArray()
  @ArrayMinSize(2)
  slotIds: number[]; // IDs of slots to merge (must be at least two)
}
