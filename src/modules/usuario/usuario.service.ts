import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class UsuarioService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    const existingUser = await this.prisma.usuario.findFirst({
      where: {
        OR: [
          { email: createUsuarioDto.email },
          { usuario: createUsuarioDto.usuario },
        ],
      },
    });

    if (existingUser) {
      throw new CustomError('Email or Usuario already exists', 409);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUsuarioDto.senha, salt);

    const newUser = await this.prisma.usuario.create({
      data: {
        email: createUsuarioDto.email,
        usuario: createUsuarioDto.usuario,
        senha_hash: hashedPassword,
        nome_completo: createUsuarioDto.nome_completo,
        ativo: createUsuarioDto.ativo ?? true,
      },
    });

    return plainToInstance(UsuarioResponseDto, newUser);
  }

  async findAll(): Promise<UsuarioResponseDto[]> {
    const users = await this.prisma.usuario.findMany();
    return users.map((user) => plainToInstance(UsuarioResponseDto, user));
  }

  async findOne(id: string): Promise<UsuarioResponseDto> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new CustomError(`Usuario with ID ${id} not found`, 404);
    }

    return plainToInstance(UsuarioResponseDto, user);
  }

  async findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
    });
  }

  async update(
    id: string,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new CustomError(`Usuario with ID ${id} not found`, 404);
    }

    const dataToUpdate: any = { ...updateUsuarioDto };

    if (updateUsuarioDto.senha) {
      const salt = await bcrypt.genSalt();
      dataToUpdate.senha_hash = await bcrypt.hash(updateUsuarioDto.senha, salt);
      delete dataToUpdate.senha;
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
    });

    return plainToInstance(UsuarioResponseDto, updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
    });

    if (!user) {
      throw new CustomError(`Usuario with ID ${id} not found`, 404);
    }

    await this.prisma.usuario.delete({
      where: { id },
    });
  }
}
