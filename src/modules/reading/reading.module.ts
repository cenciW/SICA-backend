import { Module, OnModuleInit } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { ReadingController } from './reading.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { MqttService } from '../../mqtt/mqtt.service';

@Module({
  controllers: [ReadingController],
  providers: [ReadingService, PrismaService],
})
export class ReadingModule implements OnModuleInit {
  constructor(
    private readonly mqtt: MqttService,
    private readonly readingService: ReadingService,
  ) {}

  onModuleInit() {
    this.mqtt.onTelemetry((clientId, payload) =>
      this.readingService.ingestFromDevice(clientId, payload),
    );
  }
}
