import {
  IsNumber,
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsIn,
  IsObject,
  IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';
import { PatientType } from '../entities/appointment.entity';

export class RequestedWindowDto {
  @IsString()
  date: string;

  @IsOptional()
  @IsIn(['morning', 'afternoon', 'evening'])
  partOfDay?: 'morning' | 'afternoon' | 'evening';

  @IsOptional()
  @IsBoolean()
  urgent?: boolean;
}

export class CreateAppointmentDto {
  @IsNumber()
  doctorId: number;

  @IsOptional()
  @IsNumber()
  slotId?: number;

  @IsOptional()
  @IsBoolean()
  confirmLater?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => RequestedWindowDto)
  requestedWindow?: RequestedWindowDto;

  @IsString()
  reason: string;

  @IsOptional()
  @IsEnum(PatientType)
  patientType?: PatientType;
}
