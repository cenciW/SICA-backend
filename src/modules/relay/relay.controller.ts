import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RelayService } from './relay.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SetManualDto } from './dto/set-manual.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('products/:productId/relay')
export class RelayController {
  constructor(private readonly relayService: RelayService) {}

  @Get()
  getState(
    @Param('productId') productId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.relayService.getState(productId, req.user.id);
  }

  // ── Override manual ───────────────────────────────────────────────────────

  @Patch('manual')
  setManual(
    @Param('productId') productId: string,
    @Body() dto: SetManualDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.relayService.setManual(productId, dto, req.user.id);
  }

  // ── Schedules ─────────────────────────────────────────────────────────────

  @Get('schedules')
  getSchedules(
    @Param('productId') productId: string,
    @Query('device') device: 'led' | 'pump' | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.relayService.getSchedules(productId, req.user.id, device);
  }

  @Post('schedules')
  createSchedule(
    @Param('productId') productId: string,
    @Body() dto: CreateScheduleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.relayService.createSchedule(productId, dto, req.user.id);
  }

  @Patch('schedules/:scheduleId')
  updateSchedule(
    @Param('productId') productId: string,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateScheduleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.relayService.updateSchedule(productId, scheduleId, dto, req.user.id);
  }

  @Delete('schedules/:scheduleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSchedule(
    @Param('productId') productId: string,
    @Param('scheduleId') scheduleId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.relayService.deleteSchedule(productId, scheduleId, req.user.id);
  }
}
