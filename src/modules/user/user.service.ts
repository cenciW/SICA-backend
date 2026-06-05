import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { CustomError } from 'src/utils/custom-error';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });

    if (existing) {
      throw new CustomError('Email or username already exists', 409);
    }

    const salt = await bcrypt.genSalt();
    const password_hash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password_hash,
        full_name: dto.full_name,
        active: dto.active ?? true,
      },
    });

    return plainToInstance(UserResponseDto, user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany();
    return users.map((u) => plainToInstance(UserResponseDto, u));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new CustomError(`User with ID ${id} not found`, 404);
    return plainToInstance(UserResponseDto, user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new CustomError(`User with ID ${id} not found`, 404);

    const data: any = { ...dto };

    if (dto.password) {
      const salt = await bcrypt.genSalt();
      data.password_hash = await bcrypt.hash(dto.password, salt);
      delete data.password;
    }

    const updated = await this.prisma.user.update({ where: { id }, data });
    return plainToInstance(UserResponseDto, updated);
  }

  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new CustomError(`User with ID ${id} not found`, 404);
    await this.prisma.user.delete({ where: { id } });
  }
}
