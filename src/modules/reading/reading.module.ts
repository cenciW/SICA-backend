import { Module } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { ReadingController } from './reading.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ReadingController],
  providers: [ReadingService, PrismaService],
})
export class ReadingModule {}
