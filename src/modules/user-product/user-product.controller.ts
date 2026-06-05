import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserProductService } from './user-product.service';
import { AddUserProductDto } from './dto/add-user-product.dto';
import { UpdateUserProductDto, UpdateUserProductConfigDto } from './dto/update-user-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('products/:productId')
export class UserProductController {
  constructor(private readonly userProductService: UserProductService) {}

  // ── Instâncias do usuário para o produto ──────────────────────────────────

  @Post('instances')
  createInstance(
    @Param('productId') productId: string,
    @Body('name') name: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userProductService.createInstance(productId, req.user.id, name);
  }

  @Get('instances')
  listInstances(
    @Param('productId') productId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userProductService.listInstances(productId, req.user.id);
  }

  @Patch('instances/:instanceId/config')
  updateConfig(
    @Param('instanceId') instanceId: string,
    @Body() dto: UpdateUserProductConfigDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userProductService.updateConfig(instanceId, dto, req.user.id);
  }

  // ── Gestão de acesso por OWNER ────────────────────────────────────────────

  @Get('users')
  listUsers(
    @Param('productId') productId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userProductService.listUsers(productId, req.user.id);
  }

  @Post('users')
  addUser(
    @Param('productId') productId: string,
    @Body() dto: AddUserProductDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userProductService.addUser(productId, dto, req.user.id);
  }

  @Patch('users/:instanceId')
  updateAccess(
    @Param('productId') productId: string,
    @Param('instanceId') instanceId: string,
    @Body() dto: UpdateUserProductDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userProductService.updateAccess(productId, instanceId, dto, req.user.id);
  }

  @Delete('users/:instanceId')
  revokeAccess(
    @Param('productId') productId: string,
    @Param('instanceId') instanceId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.userProductService.revokeAccess(productId, instanceId, req.user.id);
  }
}
