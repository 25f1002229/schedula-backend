import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Delete,
  ParseIntPipe
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityTimeDto } from './dto/update-availability-time.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':doctorId')
  async create(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() dto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.create(doctorId, dto);
  }

  // Get all recurring weekly patterns for a doctor
  @UseGuards(JwtAuthGuard)
  @Get(':doctorId')
  async findAllForDoctor(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.availabilityService.findAllForDoctor(doctorId);
  }

  // Elastic: update time window for specific date (shrink/expand session)
  @UseGuards(JwtAuthGuard)
  @Patch(':doctorId/update-availability-time')
  async updateForSession(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Body() dto: UpdateAvailabilityTimeDto,
  ) {
    return this.availabilityService.updateAvailabilityTime(doctorId, dto);
  }

  // Optional: get all per-date overrides for a doctor
  @UseGuards(JwtAuthGuard)
  @Get(':doctorId/overrides')
  async getOverrides(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.availabilityService.getSessionOverrides(
      doctorId,
      from,
      to,
    );
  }

  // Delete recurring availability by its ID
  @UseGuards(JwtAuthGuard)
  @Delete(':doctorId/:availabilityId')
  async deleteAvailability(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('availabilityId', ParseIntPipe) availabilityId: number,
  ) {
    return this.availabilityService.deleteAvailability(doctorId, availabilityId);
  }
}
