import { Module, OnModuleInit } from '@nestjs/common';
import { RelayService } from './relay.service';
import { RelayController } from './relay.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { MqttService } from '../../mqtt/mqtt.service';

@Module({
  controllers: [RelayController],
  providers: [RelayService, PrismaService],
})
export class RelayModule implements OnModuleInit {
  constructor(
    private readonly mqtt: MqttService,
    private readonly relayService: RelayService,
  ) {}

  onModuleInit() {
    this.mqtt.onState((clientId, payload) =>
      this.relayService.applyDeviceState(clientId, payload),
    );
  }
}
