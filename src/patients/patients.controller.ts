import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Request,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  createProfile(@Body() dto: CreatePatientProfileDto, @Req() req) {
    const userId = req.user.id; // Only use JWT userId, not from body
    return this.patientsService.createProfile(userId, dto);
  }

  @Get(':id')
  getPatient(@Param('id', ParseIntPipe) id: number) {
    return this.patientsService.findById(id);
  }

  @Patch(':id')
  updatePatient(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreatePatientProfileDto>,
  ) {
    return this.patientsService.update(id, dto);
  }
}
