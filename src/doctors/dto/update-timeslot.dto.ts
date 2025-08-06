import { IsOptional, IsString, IsDateString, Matches } from 'class-validator';

export class UpdateTimeslotDto {
  @IsOptional()
  @IsDateString()
  date?: string;  // Format: YYYY-MM-DD → ISO 8601 date string

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'startTime must be in HH:mm format' })
  startTime?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'endTime must be in HH:mm format' })
  endTime?: string;
}
