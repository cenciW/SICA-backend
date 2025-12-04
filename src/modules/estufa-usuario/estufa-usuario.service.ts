import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstufaUsuarioDto } from './dto/create-estufa-usuario.dto';
import { UpdateEstufaUsuarioDto } from './dto/update-estufa-usuario.dto';

@Injectable()
export class EstufaUsuarioService {
  constructor(private prisma: PrismaService) {}

  async create(createEstufaUsuarioDto: CreateEstufaUsuarioDto) {
    return this.prisma.estufaUsuario.create({
      data: createEstufaUsuarioDto,
    });
  }

  async findAll() {
    return this.prisma.estufaUsuario.findMany({
      include: {
        estufa: true,
        usuario: true,
      },
    });
  }

  async findOne(id: string) {
    const estufaUsuario = await this.prisma.estufaUsuario.findUnique({
      where: { id },
      include: {
        estufa: true,
        usuario: true,
      },
    });

    if (!estufaUsuario) {
      throw new NotFoundException(`EstufaUsuario with ID ${id} not found`);
    }

    return estufaUsuario;
  }

  async update(id: string, updateEstufaUsuarioDto: UpdateEstufaUsuarioDto) {
    const estufaUsuario = await this.prisma.estufaUsuario.findUnique({
      where: { id },
    });

    if (!estufaUsuario) {
      throw new NotFoundException(`EstufaUsuario with ID ${id} not found`);
    }

    return this.prisma.estufaUsuario.update({
      where: { id },
      data: updateEstufaUsuarioDto,
    });
  }

  async remove(id: string) {
    const estufaUsuario = await this.prisma.estufaUsuario.findUnique({
      where: { id },
    });

    if (!estufaUsuario) {
      throw new NotFoundException(`EstufaUsuario with ID ${id} not found`);
    }

    return this.prisma.estufaUsuario.delete({
      where: { id },
    });
  }
}
