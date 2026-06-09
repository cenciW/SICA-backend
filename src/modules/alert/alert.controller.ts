import { Controller, Get, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AlertService } from './alert.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('products/:productId/alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  findAll(
    @Param('productId') productId: string,
    @Query('resolved') resolved: string,
    @Query('take') take: string,
    @Query('skip') skip: string,
    @Request() req: AuthenticatedRequest,
  ) {
    const onlyActive = resolved !== 'true';
    return this.alertService.findAll(
      productId,
      req.user.id,
      onlyActive,
      take ? Math.min(parseInt(take), 50) : 5,
      skip ? parseInt(skip) : 0,
    );
  }

  @Patch('resolve-all')
  resolveAll(
    @Param('productId') productId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.alertService.resolveAll(productId, req.user.id);
  }

  @Patch(':alertId/resolve')
  resolve(
    @Param('productId') productId: string,
    @Param('alertId') alertId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.alertService.resolve(productId, alertId, req.user.id);
  }
}
