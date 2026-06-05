import { Module } from '@nestjs/common';
import { RelayService } from './relay.service';
import { RelayController } from './relay.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [RelayController],
  providers: [RelayService, PrismaService],
})
export class RelayModule {}
