import { Controller, Get, Patch, Param, Body, UseGuards, Request } from '@nestjs/common';
import { RelayService } from './relay.service';
import { ToggleRelayDto } from './dto/toggle-relay.dto';
import { SetCycleDto } from './dto/set-cycle.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('products/:productId/relay')
export class RelayController {
  constructor(private readonly relayService: RelayService) {}

  @Get()
  getState(@Param('productId') productId: string, @Request() req: AuthenticatedRequest) {
    return this.relayService.getState(productId, req.user.id);
  }

  @Patch('toggle')
  toggle(
    @Param('productId') productId: string,
    @Body() dto: ToggleRelayDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.relayService.toggle(productId, dto.device, dto.state, req.user.id);
  }

  @Patch('cycle')
  setCycle(
    @Param('productId') productId: string,
    @Body() dto: SetCycleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.relayService.setCycle(productId, dto, req.user.id);
  }
}
