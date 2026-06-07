import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { ReadingQueryDto } from './dto/reading-query.dto';
import { SensorType, AlertSeverity } from '@prisma/client';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class ReadingService {
  constructor(private prisma: PrismaService) {}

  async create(productId: string, dto: CreateReadingDto, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    return this.persistReading(
      userProduct,
      dto.sensor_type,
      dto.value,
      dto.unit,
    );
  }

  /**
   * Cria a leitura, atualiza o cache (*_current / last_reading_at) e checa
   * thresholds. Compartilhado entre o caminho REST (create) e o MQTT
   * (ingestFromDevice).
   */
  private async persistReading(
    userProduct: any,
    sensorType: SensorType,
    value: number,
    unit: string,
  ) {
    const reading = await this.prisma.reading.create({
      data: {
        user_product_id: userProduct.id,
        sensor_type: sensorType,
        value,
        unit,
      },
    });

    const cacheField =
      sensorType === SensorType.PH ? 'ph_current' : 'ppm_current';
    await this.prisma.userProduct.update({
      where: { id: userProduct.id },
      data: { [cacheField]: value, last_reading_at: reading.recorded_at },
    });

    await this.checkThresholds(userProduct, sensorType, value);

    return reading;
  }

  /**
   * Ingestão de telemetria via MQTT ({clientId}/telemetry).
   * Payload: { ph?: number, ppm?: number }.
   */
  async ingestFromDevice(
    clientId: string,
    payload: { ph?: number; ppm?: number },
  ) {
    const userProduct = await this.prisma.userProduct.findUnique({
      where: { client_id: clientId },
    });
    if (!userProduct) return;

    if (typeof payload.ph === 'number') {
      await this.persistReading(userProduct, SensorType.PH, payload.ph, 'pH');
    }
    if (typeof payload.ppm === 'number') {
      await this.persistReading(
        userProduct,
        SensorType.PPM,
        payload.ppm,
        'ppm',
      );
    }
  }

  async findAll(productId: string, query: ReadingQueryDto, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    return this.prisma.reading.findMany({
      where: {
        user_product_id: userProduct.id,
        ...(query.sensor_type && { sensor_type: query.sensor_type }),
        ...((query.from || query.to) && {
          recorded_at: {
            ...(query.from && { gte: new Date(query.from) }),
            ...(query.to && { lte: new Date(query.to) }),
          },
        }),
      },
      orderBy: { recorded_at: 'desc' },
      take: query.limit ?? 100,
    });
  }

  async getLatest(productId: string, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    return {
      ph_current: userProduct.ph_current,
      ppm_current: userProduct.ppm_current,
      last_reading_at: userProduct.last_reading_at,
    };
  }

  private async checkThresholds(
    userProduct: any,
    sensorType: SensorType,
    value: number,
  ) {
    const min =
      sensorType === SensorType.PH ? userProduct.ph_min : userProduct.ppm_min;
    const max =
      sensorType === SensorType.PH ? userProduct.ph_max : userProduct.ppm_max;
    const unit = sensorType === SensorType.PH ? 'pH' : 'ppm';
    const label = sensorType === SensorType.PH ? 'pH' : 'PPM';

    let threshold: number | null = null;
    let message = '';
    let isCritical = false;

    if (min !== null && min !== undefined && value < min) {
      threshold = min;
      isCritical = ((min - value) / min) * 100 >= 15;
      message = `${label} abaixo do mínimo: ${value.toFixed(2)} ${unit} (mín. ${min} ${unit})`;
    } else if (max !== null && max !== undefined && value > max) {
      threshold = max;
      isCritical = ((value - max) / max) * 100 >= 15;
      message = `${label} acima do máximo: ${value.toFixed(2)} ${unit} (máx. ${max} ${unit})`;
    }

    if (threshold !== null) {
      await this.prisma.alert.create({
        data: {
          user_product_id: userProduct.id,
          sensor_type: sensorType,
          severity: isCritical ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
          value,
          threshold,
          message,
        },
      });
    }
  }
}
