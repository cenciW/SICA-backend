import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import mqtt, { MqttClient } from 'mqtt';

type Handler = (clientId: string, payload: any) => Promise<void> | void;

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client!: MqttClient;
  private telemetryHandlers: Handler[] = [];
  private stateHandlers: Handler[] = [];

  onModuleInit() {
    const url = process.env.MQTT_URL ?? 'mqtt://localhost:1883';
    this.client = mqtt.connect(url, { reconnectPeriod: 2000 });

    this.client.on('connect', () => {
      this.logger.log(`MQTT connected: ${url}`);
      this.client.subscribe(['+/telemetry', '+/state'], { qos: 1 }, (err) => {
        if (err) this.logger.error(`Subscribe failed: ${err.message}`);
      });
    });
    this.client.on('message', (topic, buf) => this.route(topic, buf));
    this.client.on('error', (e) => this.logger.error(e.message));
  }

  onModuleDestroy() {
    this.client?.end(true);
  }

  onTelemetry(h: Handler) {
    this.telemetryHandlers.push(h);
  }

  onState(h: Handler) {
    this.stateHandlers.push(h);
  }

  publishCmd(clientId: string, payload: unknown) {
    this.client?.publish(`${clientId}/cmd`, JSON.stringify(payload), {
      qos: 1,
      retain: true,
    });
  }

  private async route(topic: string, buf: Buffer) {
    const [clientId, suffix] = topic.split('/');
    let payload: any;
    try {
      payload = JSON.parse(buf.toString());
    } catch {
      this.logger.warn(`Bad JSON on ${topic}`);
      return;
    }
    try {
      const handlers =
        suffix === 'telemetry'
          ? this.telemetryHandlers
          : suffix === 'state'
            ? this.stateHandlers
            : [];
      for (const h of handlers) await h(clientId, payload);
    } catch (e) {
      this.logger.error(`Handler error on ${topic}: ${(e as Error).message}`);
    }
  }
}
