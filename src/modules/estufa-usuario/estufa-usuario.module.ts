import { Module } from '@nestjs/common';
import { EstufaUsuarioService } from './estufa-usuario.service';
import { EstufaUsuarioController } from './estufa-usuario.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [EstufaUsuarioController],
  providers: [EstufaUsuarioService, PrismaService],
  exports: [EstufaUsuarioService],
})
export class EstufaUsuarioModule {}
