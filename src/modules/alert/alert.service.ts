import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class AlertService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    productId: string,
    userId: string,
    onlyActive: boolean,
    take = 5,
    skip = 0,
  ) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    const where = {
      user_product_id: userProduct.id,
      ...(onlyActive && { resolved: false }),
    };

    const [items, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take,
        skip,
      }),
      this.prisma.alert.count({ where }),
    ]);

    return { items, total, hasMore: skip + items.length < total };
  }

  async resolveAll(productId: string, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    const { count } = await this.prisma.alert.updateMany({
      where: { user_product_id: userProduct.id, resolved: false },
      data: { resolved: true, resolved_at: new Date() },
    });

    return { resolved: count };
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
