import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { CreatePatientDto } from './dto/create-patient.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserRole } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('patient/register')
  registerPatient(@Body() dto: CreatePatientDto) {
    return this.authService.register({
      ...dto,
      role: UserRole.PATIENT,
    });
  }

  @Post('doctor/register')
  registerDoctor(@Body() dto: CreateDoctorDto) {
    return this.authService.register({
      ...dto,
      role: UserRole.DOCTOR,
    });
  }

  @Post('login')
  login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto.email, dto.password);
  }
}
