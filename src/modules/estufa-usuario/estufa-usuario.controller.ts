import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe } from '@nestjs/common';
import { EstufaUsuarioService } from './estufa-usuario.service';
import { CreateEstufaUsuarioDto } from './dto/create-estufa-usuario.dto';
import { UpdateEstufaUsuarioDto } from './dto/update-estufa-usuario.dto';

@Controller('estufa-usuarios')
export class EstufaUsuarioController {
  constructor(private readonly estufaUsuarioService: EstufaUsuarioService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createEstufaUsuarioDto: CreateEstufaUsuarioDto) {
    return this.estufaUsuarioService.create(createEstufaUsuarioDto);
  }

  @Get()
  findAll() {
    return this.estufaUsuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.estufaUsuarioService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() updateEstufaUsuarioDto: UpdateEstufaUsuarioDto) {
    return this.estufaUsuarioService.update(id, updateEstufaUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.estufaUsuarioService.remove(id);
  }
}
