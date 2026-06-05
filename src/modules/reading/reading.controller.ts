import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { CreateReadingDto } from './dto/create-reading.dto';
import { ReadingQueryDto } from './dto/reading-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('products/:productId/readings')
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Post()
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateReadingDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.readingService.create(productId, dto, req.user.id);
  }

  @Get('latest')
  getLatest(@Param('productId') productId: string, @Request() req: AuthenticatedRequest) {
    return this.readingService.getLatest(productId, req.user.id);
  }

  @Get()
  findAll(
    @Param('productId') productId: string,
    @Query() query: ReadingQueryDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.readingService.findAll(productId, query, req.user.id);
  }
}
