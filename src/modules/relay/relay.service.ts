import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MqttService } from '../../mqtt/mqtt.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SetManualDto } from './dto/set-manual.dto';
import { CustomError } from 'src/utils/custom-error';

// Brasil UTC-3: minutos locais + 180 = minutos UTC (mod 1440)
const UTC_OFFSET_MIN = 180;

@Injectable()
export class RelayService {
  constructor(
    private prisma: PrismaService,
    private mqtt: MqttService,
  ) {}

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async findUserProduct(productId: string, userId: string) {
    const up = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!up) throw new CustomError('Product not found', 404);
    return up;
  }

  /** Converte "HH:MM" local (UTC-3) para minutos desde meia-noite em UTC. */
  private toUtcMinutes(localTime: string): number {
    const [h, m] = localTime.split(':').map(Number);
    return ((h * 60 + m) + UTC_OFFSET_MIN) % 1440;
  }

  /** Lê schedules + override manual do banco e publica o cmd MQTT. */
  private async publishSchedules(clientId: string, userProductId: string) {
    const [up, all] = await Promise.all([
      this.prisma.userProduct.findUnique({
        where: { id: userProductId },
        select: { led_manual: true, pump_manual: true },
      }),
      this.prisma.deviceSchedule.findMany({
        where: { user_product_id: userProductId, enabled: true },
        orderBy: { sort_order: 'asc' },
      }),
    ]);

    // -1 = auto (seguir schedule), 0 = forçado OFF, 1 = forçado ON
    const toManual = (v: boolean | null | undefined): number =>
      v === null || v === undefined ? -1 : v ? 1 : 0;

    const led = all
      .filter((s) => s.device === 'led')
      .map((s) => ({ start: this.toUtcMinutes(s.start_time), end: this.toUtcMinutes(s.end_time) }));

    const pump = all
      .filter((s) => s.device === 'pump')
      .map((s) => ({ start: this.toUtcMinutes(s.start_time), end: this.toUtcMinutes(s.end_time) }));

    this.mqtt.publishCmd(clientId, {
      ts: Math.floor(Date.now() / 1000),
      led:  { schedules: led,  manual: toManual(up?.led_manual)  },
      pump: { schedules: pump, manual: toManual(up?.pump_manual) },
    });
  }

  // ── Estado ────────────────────────────────────────────────────────────────

  async getState(productId: string, userId: string) {
    const up = await this.findUserProduct(productId, userId);
    return {
      relay_state: up.relay_state,
      relay_last_action_at: up.relay_last_action_at,
      pump_state: up.pump_state,
      pump_last_action_at: up.pump_last_action_at,
    };
  }

  /**
   * Aplica o estado real reportado pelo firmware via {clientId}/state.
   * Payload: { led?: boolean, pump?: boolean }.
   */
  async applyDeviceState(
    clientId: string,
    payload: { led?: boolean; pump?: boolean },
  ) {
    const up = await this.prisma.userProduct.findUnique({
      where: { client_id: clientId },
    });
    if (!up) return;

    console.log(`Applying state from ${clientId}:`, payload);

    const data: Record<string, unknown> = {};
    if (typeof payload.led === 'boolean') {
      data.relay_state = payload.led;
      data.relay_last_action_at = new Date();
    }
    if (typeof payload.pump === 'boolean') {
      data.pump_state = payload.pump;
      data.pump_last_action_at = new Date();
    }
    if (Object.keys(data).length) {
      await this.prisma.userProduct.update({ where: { id: up.id }, data });
    }
  }

  // ── Override manual ───────────────────────────────────────────────────────

  async setManual(productId: string, dto: SetManualDto, userId: string) {
    const up = await this.findUserProduct(productId, userId);

    const manualValue: boolean | null =
      dto.state === 'auto' ? null : dto.state === 'on';

    const updated = await this.prisma.userProduct.update({
      where: { id: up.id },
      data:
        dto.device === 'led'
          ? { led_manual: manualValue }
          : { pump_manual: manualValue },
    });

    await this.publishSchedules(up.client_id, up.id);

    return {
      relay_state: updated.relay_state,
      relay_last_action_at: updated.relay_last_action_at,
      pump_state: updated.pump_state,
      pump_last_action_at: updated.pump_last_action_at,
      led_manual: updated.led_manual,
      pump_manual: updated.pump_manual,
    };
  }

  // ── Schedule CRUD ─────────────────────────────────────────────────────────

  async getSchedules(productId: string, userId: string, device?: 'led' | 'pump') {
    const up = await this.findUserProduct(productId, userId);
    return this.prisma.deviceSchedule.findMany({
      where: { user_product_id: up.id, ...(device ? { device } : {}) },
      orderBy: { sort_order: 'asc' },
    });
  }

  async createSchedule(productId: string, dto: CreateScheduleDto, userId: string) {
    const up = await this.findUserProduct(productId, userId);

    const schedule = await this.prisma.deviceSchedule.create({
      data: {
        user_product_id: up.id,
        device: dto.device,
        start_time: dto.start_time,
        end_time: dto.end_time,
        enabled: dto.enabled ?? true,
        sort_order: dto.sort_order ?? 0,
      },
    });

    await this.publishSchedules(up.client_id, up.id);
    return schedule;
  }

  async updateSchedule(
    productId: string,
    scheduleId: string,
    dto: UpdateScheduleDto,
    userId: string,
  ) {
    const up = await this.findUserProduct(productId, userId);

    const existing = await this.prisma.deviceSchedule.findFirst({
      where: { id: scheduleId, user_product_id: up.id },
    });
    if (!existing) throw new CustomError('Schedule not found', 404);

    const schedule = await this.prisma.deviceSchedule.update({
      where: { id: scheduleId },
      data: {
        ...(dto.start_time !== undefined && { start_time: dto.start_time }),
        ...(dto.end_time !== undefined && { end_time: dto.end_time }),
        ...(dto.enabled !== undefined && { enabled: dto.enabled }),
        ...(dto.sort_order !== undefined && { sort_order: dto.sort_order }),
      },
    });

    await this.publishSchedules(up.client_id, up.id);
    return schedule;
  }

  async deleteSchedule(productId: string, scheduleId: string, userId: string) {
    const up = await this.findUserProduct(productId, userId);

    const existing = await this.prisma.deviceSchedule.findFirst({
      where: { id: scheduleId, user_product_id: up.id },
    });
    if (!existing) throw new CustomError('Schedule not found', 404);

    await this.prisma.deviceSchedule.delete({ where: { id: scheduleId } });
    await this.publishSchedules(up.client_id, up.id);
  }
}
