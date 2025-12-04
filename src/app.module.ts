import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { EstufaModule } from './modules/estufa/estufa.module';
import { EstufaUsuarioModule } from './modules/estufa-usuario/estufa-usuario.module';
import { ModuloModule } from './modules/modulo/modulo.module';

@Module({
  imports: [AuthModule, UsuarioModule, EstufaModule, EstufaUsuarioModule, ModuloModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
