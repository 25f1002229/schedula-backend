import { IsIn, IsString, IsNotEmpty } from 'class-validator';

export class CreateAvailabilityDto {
  @IsString()
  @IsIn([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ])
  dayOfWeek: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}
