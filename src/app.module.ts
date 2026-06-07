import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { UserProductModule } from './modules/user-product/user-product.module';
import { ReadingModule } from './modules/reading/reading.module';
import { RelayModule } from './modules/relay/relay.module';
import { AlertModule } from './modules/alert/alert.module';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [
    MqttModule,
    AuthModule,
    UserModule,
    ProductModule,
    UserProductModule,
    ReadingModule,
    RelayModule,
    AlertModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
