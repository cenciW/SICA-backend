import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddUserProductDto } from './dto/add-user-product.dto';
import { UpdateUserProductDto, UpdateUserProductConfigDto } from './dto/update-user-product.dto';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class UserProductService {
  constructor(private prisma: PrismaService) {}

  private async generateUniqueClientId(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id: string;
    let exists: boolean;
    do {
      id = Array.from(
        { length: 6 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join('');
      exists = !!(await this.prisma.userProduct.findUnique({ where: { client_id: id } }));
    } while (exists);
    return id;
  }

  private async assertOwner(productId: string, requesterId: string) {
    const access = await this.prisma.userProduct.findFirst({
      where: { product_id: productId, user_id: requesterId, role: 'OWNER' },
    });
    if (!access) throw new CustomError('Only the product OWNER can manage access', 403);
  }

  async createInstance(productId: string, userId: string, name?: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new CustomError('Product not found', 404);

    const client_id = await this.generateUniqueClientId();

    return this.prisma.userProduct.create({
      data: {
        product_id: productId,
        user_id: userId,
        role: 'OWNER',
        name: name ?? null,
        client_id,
      },
    });
  }

  async listInstances(productId: string, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new CustomError('Product not found', 404);

    return this.prisma.userProduct.findMany({
      where: { product_id: productId, user_id: userId },
      orderBy: { access_start: 'asc' },
    });
  }

  async updateConfig(instanceId: string, dto: UpdateUserProductConfigDto, userId: string) {
    const instance = await this.prisma.userProduct.findUnique({ where: { id: instanceId } });
    if (!instance || instance.user_id !== userId)
      throw new CustomError('Instance not found', 404);

    return this.prisma.userProduct.update({
      where: { id: instanceId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.ph_min !== undefined && { ph_min: dto.ph_min }),
        ...(dto.ph_max !== undefined && { ph_max: dto.ph_max }),
        ...(dto.ppm_min !== undefined && { ppm_min: dto.ppm_min }),
        ...(dto.ppm_max !== undefined && { ppm_max: dto.ppm_max }),
      },
    });
  }

  async listUsers(productId: string, requesterId: string) {
    await this.assertOwner(productId, requesterId);
    return this.prisma.userProduct.findMany({
      where: { product_id: productId },
      include: {
        user: { select: { id: true, email: true, username: true, full_name: true } },
      },
      orderBy: { access_start: 'asc' },
    });
  }

  async addUser(productId: string, dto: AddUserProductDto, requesterId: string) {
    await this.assertOwner(productId, requesterId);

    const client_id = await this.generateUniqueClientId();

    return this.prisma.userProduct.create({
      data: {
        product_id: productId,
        user_id: dto.userId,
        role: dto.role,
        client_id,
      },
      include: {
        user: { select: { id: true, email: true, username: true, full_name: true } },
      },
    });
  }

  async updateAccess(
    productId: string,
    instanceId: string,
    dto: UpdateUserProductDto,
    requesterId: string,
  ) {
    await this.assertOwner(productId, requesterId);

    const access = await this.prisma.userProduct.findUnique({ where: { id: instanceId } });
    if (!access || access.product_id !== productId)
      throw new CustomError('Instance not found', 404);

    if (access.role === 'OWNER' && dto.role && dto.role !== 'OWNER')
      throw new CustomError('Cannot downgrade the product OWNER', 422);

    return this.prisma.userProduct.update({
      where: { id: instanceId },
      data: {
        ...(dto.role && { role: dto.role }),
        ...(dto.access_end && { access_end: new Date(dto.access_end) }),
      },
      include: {
        user: { select: { id: true, email: true, username: true, full_name: true } },
      },
    });
  }

  async revokeAccess(productId: string, instanceId: string, requesterId: string) {
    await this.assertOwner(productId, requesterId);

    const access = await this.prisma.userProduct.findUnique({ where: { id: instanceId } });
    if (!access || access.product_id !== productId)
      throw new CustomError('Instance not found', 404);
    if (access.role === 'OWNER')
      throw new CustomError('Cannot revoke access from the product OWNER', 422);

    await this.prisma.userProduct.delete({ where: { id: instanceId } });
  }
}
