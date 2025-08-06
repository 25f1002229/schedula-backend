import { IsOptional, IsString } from 'class-validator';

export class CancelAppointmentDto {
  @IsOptional()
  @IsString()
  cancellationReason?: string;  // Optional reason for cancelling
}
