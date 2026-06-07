import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MqttService } from '../../mqtt/mqtt.service';
import { SetCycleDto } from './dto/set-cycle.dto';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class RelayService {
  constructor(
    private prisma: PrismaService,
    private mqtt: MqttService,
  ) {}

  async getState(productId: string, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    return {
      relay_state: userProduct.relay_state,
      relay_last_action_at: userProduct.relay_last_action_at,
      pump_state: userProduct.pump_state,
      pump_last_action_at: userProduct.pump_last_action_at,
    };
  }

  /**
   * Toggle manual mapeado para o modelo de ciclo:
   * - state=true  => sempre ligado (on_seconds=1, off_seconds=0)
   * - state=false => desligado     (on_seconds=0)
   * Como não há ciclo nesses casos, start_on é irrelevante.
   *
   * NÃO grava relay_state/pump_state aqui: o comando apenas é publicado no
   * tópico cmd. O estado real só é persistido quando o firmware confirma via
   * {clientId}/state -> applyDeviceState(). O retorno traz o estado ATUAL
   * (último confirmado) para o app comparar enquanto aguarda a confirmação.
   */
  async toggle(
    productId: string,
    device: 'led' | 'pump',
    state: boolean,
    userId: string,
  ) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    const onSeconds = state ? 1 : 0;
    const data =
      device === 'led'
        ? { led_on_seconds: onSeconds, led_off_seconds: 0 }
        : { pump_on_seconds: onSeconds, pump_off_seconds: 0 };

    const updated = await this.prisma.userProduct.update({
      where: { id: userProduct.id },
      data,
    });

    this.publishConfig(updated);

    return {
      id: updated.id,
      relay_state: updated.relay_state,
      relay_last_action_at: updated.relay_last_action_at,
      pump_state: updated.pump_state,
      pump_last_action_at: updated.pump_last_action_at,
    };
  }

  /**
   * Define a config de ciclo (segundos + start_on) por device, persiste e
   * publica em {clientId}/cmd. Atualiza apenas os campos enviados no DTO.
   */
  async setCycle(productId: string, dto: SetCycleDto, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    const updated = await this.prisma.userProduct.update({
      where: { id: userProduct.id },
      data: {
        ...(dto.led_on_seconds !== undefined && {
          led_on_seconds: dto.led_on_seconds,
        }),
        ...(dto.led_off_seconds !== undefined && {
          led_off_seconds: dto.led_off_seconds,
        }),
        ...(dto.led_start_on !== undefined && {
          led_start_on: dto.led_start_on,
        }),
        ...(dto.pump_on_seconds !== undefined && {
          pump_on_seconds: dto.pump_on_seconds,
        }),
        ...(dto.pump_off_seconds !== undefined && {
          pump_off_seconds: dto.pump_off_seconds,
        }),
        ...(dto.pump_start_on !== undefined && {
          pump_start_on: dto.pump_start_on,
        }),
      },
    });

    this.publishConfig(updated);

    return {
      id: updated.id,
      led_on_seconds: updated.led_on_seconds,
      led_off_seconds: updated.led_off_seconds,
      led_start_on: updated.led_start_on,
      pump_on_seconds: updated.pump_on_seconds,
      pump_off_seconds: updated.pump_off_seconds,
      pump_start_on: updated.pump_start_on,
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
    const userProduct = await this.prisma.userProduct.findUnique({
      where: { client_id: clientId },
    });
    if (!userProduct) return;

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
      await this.prisma.userProduct.update({
        where: { id: userProduct.id },
        data,
      });
    }
  }

  private publishConfig(up: {
    client_id: string;
    led_on_seconds: number;
    led_off_seconds: number;
    led_start_on: boolean;
    pump_on_seconds: number;
    pump_off_seconds: number;
    pump_start_on: boolean;
  }) {
    this.mqtt.publishCmd(up.client_id, {
      ts: Math.floor(Date.now() / 1000),
      led: {
        on_seconds: up.led_on_seconds,
        off_seconds: up.led_off_seconds,
        start_on: up.led_start_on,
      },
      pump: {
        on_seconds: up.pump_on_seconds,
        off_seconds: up.pump_off_seconds,
        start_on: up.pump_start_on,
      },
    });
  }
}
