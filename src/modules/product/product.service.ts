import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  private async generateUniqueLinkCode(): Promise<string> {
    let code: string;
    let exists: boolean;
    do {
      code = String(Math.floor(100000 + Math.random() * 900000));
      exists = !!(await this.prisma.product.findUnique({
        where: { link_code: code },
      }));
    } while (exists);
    return code;
  }

  private async generateUniqueClientId(): Promise<string> {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id: string;
    let exists: boolean;
    do {
      id = Array.from(
        { length: 6 },
        () => chars[Math.floor(Math.random() * chars.length)],
      ).join('');
      exists = !!(await this.prisma.userProduct.findUnique({
        where: { client_id: id },
      }));
    } while (exists);
    return id;
  }

  async create(dto: CreateProductDto, userId: string) {
    const link_code = dto.link_code ?? (await this.generateUniqueLinkCode());

    const product = await this.prisma.product.create({
      data: { ...dto, link_code, user_id: userId },
    });

    const client_id = await this.generateUniqueClientId();
    await this.prisma.userProduct.create({
      data: {
        product_id: product.id,
        user_id: userId,
        role: 'OWNER',
        client_id,
      },
    });

    return product;
  }

  async link(code: string, userId: string) {
    const product = await this.prisma.product.findUnique({
      where: { link_code: code },
    });
    if (!product)
      throw new CustomError('Produto não encontrado com este código', 404);

    const client_id = await this.generateUniqueClientId();
    const instance = await this.prisma.userProduct.create({
      data: {
        product_id: product.id,
        user_id: userId,
        role: 'OWNER',
        client_id,
      },
    });

    return {
      ...product,
      instanceId: instance.id,
      clientId: instance.client_id,
    };
  }

  async findAll(userId: string, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.product.findMany({
        orderBy: { created_at: 'desc' },
        include: { _count: { select: { userProducts: true } } },
      });
    }

    const products = await this.prisma.product.findMany({
      where: { userProducts: { some: { user_id: userId } } },
      include: {
        userProducts: {
          where: { user_id: userId },
          take: 1,
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return products.map(({ userProducts, ...p }) => {
      const up = userProducts[0];
      if (!up) return p;
      return {
        ...p,
        userRole: up.role,
        instanceId: up.id,
        clientId: up.client_id,
        instanceName: up.name,
        ph_min: up.ph_min,
        ph_max: up.ph_max,
        ppm_min: up.ppm_min,
        ppm_max: up.ppm_max,
        ph_current: up.ph_current,
        ppm_current: up.ppm_current,
        last_reading_at: up.last_reading_at,
        relay_state: up.relay_state,
        relay_last_action_at: up.relay_last_action_at,
        pump_state: up.pump_state,
        pump_last_action_at: up.pump_last_action_at,
        led_on_seconds: up.led_on_seconds,
        led_off_seconds: up.led_off_seconds,
        led_start_on: up.led_start_on,
        pump_on_seconds: up.pump_on_seconds,
        pump_off_seconds: up.pump_off_seconds,
        pump_start_on: up.pump_start_on,
      };
    });
  }

  async findOne(id: string, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: id, user_id: userId },
    });
    if (!userProduct) throw new CustomError('Product not found', 404);

    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new CustomError('Product not found', 404);

    const readings = await this.prisma.reading.findMany({
      where: { user_product_id: userProduct.id },
      orderBy: { recorded_at: 'desc' },
      take: 10,
    });

    const alerts = await this.prisma.alert.findMany({
      where: { user_product_id: userProduct.id, resolved: false },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    return {
      ...product,
      userRole: userProduct.role,
      instanceId: userProduct.id,
      clientId: userProduct.client_id,
      instanceName: userProduct.name,
      ph_min: userProduct.ph_min,
      ph_max: userProduct.ph_max,
      ppm_min: userProduct.ppm_min,
      ppm_max: userProduct.ppm_max,
      ph_current: userProduct.ph_current,
      ppm_current: userProduct.ppm_current,
      last_reading_at: userProduct.last_reading_at,
      relay_state: userProduct.relay_state,
      relay_last_action_at: userProduct.relay_last_action_at,
      pump_state: userProduct.pump_state,
      pump_last_action_at: userProduct.pump_last_action_at,
      led_on_seconds: userProduct.led_on_seconds,
      led_off_seconds: userProduct.led_off_seconds,
      led_start_on: userProduct.led_start_on,
      pump_on_seconds: userProduct.pump_on_seconds,
      pump_off_seconds: userProduct.pump_off_seconds,
      pump_start_on: userProduct.pump_start_on,
      readings,
      alerts,
    };
  }

  async update(id: string, dto: UpdateProductDto, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: id, user_id: userId, role: 'OWNER' },
    });
    if (!userProduct)
      throw new CustomError(
        'Product not found or insufficient permissions',
        404,
      );

    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: string, userId: string) {
    const userProduct = await this.prisma.userProduct.findFirst({
      where: { product_id: id, user_id: userId, role: 'OWNER' },
    });
    if (!userProduct)
      throw new CustomError(
        'Product not found or insufficient permissions',
        404,
      );

    await this.prisma.product.delete({ where: { id } });
  }

  async removeAsAdmin(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new CustomError('Product not found', 404);

    const linkCount = await this.prisma.userProduct.count({
      where: { product_id: id },
    });
    if (linkCount > 0)
      throw new CustomError(
        `Não é possível excluir: ${linkCount} usuário(s) possuem este produto vinculado.`,
        409,
      );

    await this.prisma.product.delete({ where: { id } });
  }
}
