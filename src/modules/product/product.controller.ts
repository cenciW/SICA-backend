import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { LinkProductDto } from './dto/link-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() dto: CreateProductDto, @Request() req: AuthenticatedRequest) {
    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Apenas administradores podem criar produtos diretamente. Use o código de vinculação.',
      );
    }
    return this.productService.create(dto, req.user.id);
  }

  @Post('link')
  link(@Body() dto: LinkProductDto, @Request() req: AuthenticatedRequest) {
    return this.productService.link(dto.code, req.user.id);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.productService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.productService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.productService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    if (req.user.role === 'ADMIN') {
      return this.productService.removeAsAdmin(id);
    }
    return this.productService.remove(id, req.user.id);
  }
}
