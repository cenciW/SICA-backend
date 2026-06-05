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
    @Request() req: AuthenticatedRequest,
  ) {
    const onlyActive = resolved !== 'true';
    return this.alertService.findAll(productId, req.user.id, onlyActive);
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
