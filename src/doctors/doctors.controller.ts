import {
  Controller,
  Get,
  Req,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
  Query
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateTimeslotDto } from './dto/create-timeslot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { CreateElasticSlotsDto } from './dto/create-elastic-slots.dto';
import { UpdateSlotDurationDto } from './dto/update-slot-duration.dto';
import { UpdateTimeslotDto } from './dto/update-timeslot.dto';
import { CreateAvailabilityDto } from '../availability/dto/create-availability.dto';
import { UpdateScheduleTypeDto } from './dto/update-schedule-type.dto';
import { BatchMergeSlotsDto } from './dto/batch-merge-slots.dto';
import { UpdateAvailabilityTimeDto } from '../availability/dto/update-availability-time.dto';
import { UpdateMaxBookingsDto } from './dto/update-max-bookings.dto';
import { SlotMode } from '../doctors/entities/doctor-timeslot.entity';
import { CancelSlotsDto } from './dto/cancel-slots.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private doctorsService: DoctorsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getAll() {
    return this.doctorsService.getAll();
  }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.doctorsService.getById(id);
  }

  @Get(':id/slots')
  getDoctorSlots(
  @Param('id', ParseIntPipe) id: number,
  @Query('date') dateStr?: string,
  ) {
  return this.doctorsService.getTimeslots(id, dateStr);
  }

  @Post(':id/slots')
  @UseGuards(JwtAuthGuard)
  createTimeslot(
    @Param('id', ParseIntPipe) doctorId: number,
    @Body() dto: CreateTimeslotDto
  ) {
    return this.doctorsService.createTimeslot(doctorId, dto);
  }

  @Post(':id/generate-elastic-slots')
  @UseGuards(JwtAuthGuard)
  generateElasticSlots(
    @Param('id', ParseIntPipe) doctorId: number,
    @Body() dto: CreateElasticSlotsDto,
  ) {
    return this.doctorsService.generateElasticSlots(doctorId, dto);
  }

  @Post(':id/update-slot-duration')
  @UseGuards(JwtAuthGuard)
  updateSlotDuration(
    @Param('id', ParseIntPipe) doctorId: number,
    @Body() dto: UpdateSlotDurationDto,
  ) {
    return this.doctorsService.updateSlotDuration(doctorId, dto.slotId, dto.newDuration);
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard)
  createProfile(@Body() dto: CreateDoctorProfileDto, @Req() req) {
    const userId = req.user.id; // Only use JWT userId, not from body
    return this.doctorsService.createProfile(userId, dto);
  }

  @Post(':id/availability')
  @UseGuards(JwtAuthGuard)
  createAvailability(
  @Param('id', ParseIntPipe) doctorId: number,
  @Body() dto: CreateAvailabilityDto,
  ) {
  return this.doctorsService.createAvailability(doctorId, dto);
  }

  @Post(':id/pre-generate-slots')
  @UseGuards(JwtAuthGuard)
  async preGenerateSlots(
  @Param('id', ParseIntPipe) doctorId: number,
  @Query('months') months?: string,
  @Query('weeks') weeks?: string,
  @Query('mode') mode?: 'stream' | 'wave',
  @Query('slotDuration') slotDurationStr?: string,
  @Query('maxBookings') maxBookingsStr?: string,
  ) {
  const today = new Date();
  const futureDate = new Date(today);

  const monthsNum = months ? parseInt(months) : 0;
  const weeksNum = weeks ? parseInt(weeks) : 0;

  futureDate.setMonth(today.getMonth() + monthsNum);
  futureDate.setDate(futureDate.getDate() + 7 * weeksNum);


  if (monthsNum === 0 && weeksNum === 0) {
  // Default: 3 months
  futureDate.setMonth(today.getMonth() + 3);
  }

  const slotMode = mode === 'wave' ? SlotMode.WAVE : SlotMode.STREAM;
  // Call your doctorsService method, and (optionally) pass doctorId if your service can generate for one doctor only
  const slotDuration = slotDurationStr ? parseInt(slotDurationStr) : undefined;
  const maxBookings = maxBookingsStr ? parseInt(maxBookingsStr, 10) : undefined; 

  return this.doctorsService.preGenerateFutureSlots(today, futureDate, slotMode, doctorId, slotDuration, maxBookings);
  }

  @Patch(':id/slots/mode')
  @UseGuards(JwtAuthGuard)
  updateSlotMode(
  @Param('id', ParseIntPipe) doctorId: number,

  @Body() dto: UpdateScheduleTypeDto,
  ) {
  return this.doctorsService.updateSlotMode(
    doctorId,
    dto.slotId,
    dto.newMode,
    dto.maxBookings,
  );
  }
  
  @Patch(':id/batch-merge-slots')
  @UseGuards(JwtAuthGuard)
  async batchMergeSlots(
  @Param('id', ParseIntPipe) doctorId: number,
  @Body() dto: BatchMergeSlotsDto,
  ) {
  return this.doctorsService.batchMergeSlots(doctorId, dto.slotIds);
  }

  @Patch(':doctorId/update-availability-time')
  @UseGuards(JwtAuthGuard)
  updateAvailabilityTime(
  @Param('doctorId', ParseIntPipe) doctorId: number,
  @Body() body: UpdateAvailabilityTimeDto,
  ) {
  return this.doctorsService.updateAvailabilityWindow(doctorId, body);
  }

  @Patch(':doctorId/slots/max-bookings')
  @UseGuards(JwtAuthGuard)
  async updateMaxBookings(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() dto: UpdateMaxBookingsDto,
  ) {
    return this.doctorsService.updateMaxBookings(doctorId, dto);
  }

  @Patch(':doctorId/slots/:slotId')
  async updateTimeslot(
  @Param('doctorId', ParseIntPipe) doctorId: number,
  @Param('slotId', ParseIntPipe) slotId: number,
  @Body() dto: UpdateTimeslotDto,
  ) {
  return this.doctorsService.updateTimeslot(doctorId, slotId, dto);
  }


  @Post(':doctorId/cancel-slots')
  @UseGuards(JwtAuthGuard)
  async cancelSlots(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() cancelSlotsDto: CancelSlotsDto,
  ) {
    return this.doctorsService.cancelSlots(doctorId, cancelSlotsDto.slotIds);
  }
}
