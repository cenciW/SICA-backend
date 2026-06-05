import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class RelayService {
  constructor(private prisma: PrismaService) {}

  async getState(productId: string, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    return {
      relay_state: userProduct.relay_state,
      relay_last_action_at: userProduct.relay_last_action_at,
      pump_state: userProduct.pump_state,
      pump_last_action_at: userProduct.pump_last_action_at,
    };
  }

  async toggle(
    productId: string,
    device: 'led' | 'pump',
    state: boolean,
    userId: string,
  ) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    const data =
      device === 'led'
        ? { relay_state: state, relay_last_action_at: new Date() }
        : { pump_state: state, pump_last_action_at: new Date() };

    const updated = await this.prisma.userProduct.update({
      where: { id: userProduct.id },
      data,
      select: {
        id: true,
        relay_state: true,
        relay_last_action_at: true,
        pump_state: true,
        pump_last_action_at: true,
      },
    });

    return updated;
  }
}
