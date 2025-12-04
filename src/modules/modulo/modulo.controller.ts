import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ModuloService } from './modulo.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { ToggleAtuadorDto } from './dto/toggle-atuador.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('modulos')
@UseGuards(JwtAuthGuard)
export class ModuloController {
  constructor(private readonly moduloService: ModuloService) {}

  @Post()
  create(@Body() createModuloDto: CreateModuloDto) {
    return this.moduloService.create(createModuloDto);
  }

  @Get('estufa/:estufaId')
  findAllByEstufa(@Param('estufaId') estufaId: string) {
    return this.moduloService.findAllByEstufa(estufaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduloService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModuloDto: UpdateModuloDto) {
    return this.moduloService.update(id, updateModuloDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduloService.remove(id);
  }

  @Patch(':moduloId/atuadores/:atuadorId/toggle')
  toggleAtuador(
    @Param('moduloId') moduloId: string,
    @Param('atuadorId') atuadorId: string,
    @Body() toggleDto: ToggleAtuadorDto,
  ) {
    return this.moduloService.toggleAtuador(moduloId, atuadorId, toggleDto.estado);
  }
}
