import { IsString, IsNumber, Min, Max } from 'class-validator';

export class CreatePatientProfileDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  age: number;

  @IsString()
  sex: string;

  @IsNumber()
  weight: number;

  @IsString()
  complaint: string;
}
