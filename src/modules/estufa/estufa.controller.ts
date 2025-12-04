import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { EstufaService } from './estufa.service';
import { CreateEstufaDto } from './dto/create-estufa.dto';
import { UpdateEstufaDto } from './dto/update-estufa.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('estufas')
@UseGuards(JwtAuthGuard)
export class EstufaController {
  constructor(private readonly estufaService: EstufaService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createEstufaDto: CreateEstufaDto) {
    return this.estufaService.create(createEstufaDto);
  }

  @Post('vincular')
  vincular(@Body('codigo') codigo: string, @Req() req: any) {
    return this.estufaService.vincularEstufa(codigo, req.user.id);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.estufaService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estufaService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateEstufaDto: UpdateEstufaDto) {
    return this.estufaService.update(id, updateEstufaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estufaService.remove(id);
  }

  @Patch(':id/device')
  toggleDevice(
    @Param('id') id: string,
    @Body('device') device: string,
    @Body('state') state: boolean,
  ) {
    return this.estufaService.toggleDevice(id, device, state);
  }
}
