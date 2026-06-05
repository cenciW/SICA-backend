import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class AlertService {
  constructor(private prisma: PrismaService) {}

  async findAll(productId: string, userId: string, onlyActive: boolean) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    return this.prisma.alert.findMany({
      where: {
        user_product_id: userProduct.id,
        ...(onlyActive && { resolved: false }),
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async resolve(productId: string, alertId: string, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    const alert = await this.prisma.alert.findFirst({
      where: { id: alertId, user_product_id: userProduct.id },
    });
    if (!alert) throw new CustomError('Alert not found', 404);

    return this.prisma.alert.update({
      where: { id: alertId },
      data: { resolved: true, resolved_at: new Date() },
    });
  }
}
