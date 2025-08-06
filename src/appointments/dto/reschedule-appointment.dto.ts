import { IsEnum, IsOptional } from 'class-validator';
import { PatientType } from '../entities/appointment.entity';

export class RescheduleAppointmentDto {
  @IsOptional()
  newSlotId?: number | null;

  @IsOptional()
  confirmLater?: boolean;

  @IsOptional()
  requestedWindow?: {
    date: string;
    partOfDay?: 'morning' | 'afternoon' | 'evening';
    urgent?: boolean;
  };

  @IsOptional()
  @IsEnum(PatientType)
  patientType?: PatientType;
}
