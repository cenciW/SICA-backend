import { Module } from '@nestjs/common';
import { UserProductService } from './user-product.service';
import { UserProductController } from './user-product.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [UserProductController],
  providers: [UserProductService, PrismaService],
  exports: [UserProductService],
})
export class UserProductModule {}
