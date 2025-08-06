import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateDoctorProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  specialty: string;

  @IsString()
  @IsOptional()
  qualifications?: string;

  @IsNumber()
  @Min(0)
  experienceYears: number;

  // Don't include userId unless your API expects it from the POST body.
  // If you need it, uncomment the following lines:
  // @IsNumber()
  // @IsNotEmpty()
  // userId: number;
}
