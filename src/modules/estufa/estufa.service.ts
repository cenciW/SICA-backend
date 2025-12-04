import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstufaDto } from './dto/create-estufa.dto';
import { UpdateEstufaDto } from './dto/update-estufa.dto';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class EstufaService {
  constructor(private prisma: PrismaService) {}

  async create(createEstufaDto: CreateEstufaDto) {
    return this.prisma.estufa.create({
      data: createEstufaDto,
    });
  }

  async findAll(usuarioId?: string) {
    if (usuarioId) {
      return this.prisma.estufa.findMany({
        where: {
          usuarios: {
            some: {
              usuario_id: usuarioId,
            },
          },
        },
      });
    }
    return this.prisma.estufa.findMany();
  }

  async findOne(id: string) {
    const estufa = await this.prisma.estufa.findUnique({
      where: { id },
    });

    if (!estufa) {
      throw new CustomError(`Estufa with ID ${id} not found`, 404);
    }

    return estufa;
  }

  async update(id: string, updateEstufaDto: UpdateEstufaDto) {
    const estufa = await this.prisma.estufa.findUnique({
      where: { id },
    });

    if (!estufa) {
      throw new CustomError(`Estufa with ID ${id} not found`, 404);
    }

    return this.prisma.estufa.update({
      where: { id },
      data: updateEstufaDto,
    });
  }

  async remove(id: string) {
    const estufa = await this.prisma.estufa.findUnique({
      where: { id },
    });

    if (!estufa) {
      throw new CustomError(`Estufa with ID ${id} not found`, 404);
    }

    return this.prisma.estufa.delete({
      where: { id },
    });
  }
  async vincularEstufa(codigo: string, usuarioId: string) {
    let estufa = await this.prisma.estufa.findUnique({
      where: { codigo_vinculo: codigo },
    });

    if (!estufa) {
      // Symbolic creation
      estufa = await this.prisma.estufa.create({
        data: {
          nome: `Estufa ${codigo}`,
          codigo_vinculo: codigo,
          largura: 1.0,
          altura: 1.0,
          comprimento: 1.0,
          status: 'ativa',
        },
      });
    }

    const existingLink = await this.prisma.estufaUsuario.findFirst({
      where: {
        estufa_id: estufa.id,
        usuario_id: usuarioId,
      },
    });

    if (existingLink) {
      throw new CustomError('Usuário já vinculado a esta estufa.', 409);
    }

    await this.prisma.estufaUsuario.create({
      data: {
        estufa_id: estufa.id,
        usuario_id: usuarioId,
        role: 'USER',
      },
    });

    return estufa;
  }

  async toggleDevice(id: string, device: string, state: boolean) {
    const estufa = await this.prisma.estufa.findUnique({
      where: { id },
    });

    if (!estufa) {
      throw new CustomError(`Estufa with ID ${id} not found`, 404);
    }

    const validDevices = ['exaustor', 'ventilador', 'led'];
    if (!validDevices.includes(device)) {
      throw new CustomError(`Invalid device: ${device}`, 404);
    }

    return this.prisma.estufa.update({
      where: { id },
      data: {
        [`${device}_ligado`]: state,
      },
    });
  }
}
