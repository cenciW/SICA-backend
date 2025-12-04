import { Module } from '@nestjs/common';
import { EstufaService } from './estufa.service';
import { EstufaController } from './estufa.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [EstufaController],
  providers: [EstufaService, PrismaService],
  exports: [EstufaService],
})
export class EstufaModule {}
