import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateEstufaUsuarioDto {
  @IsUUID()
  @IsNotEmpty()
  estufa_id: string;

  @IsUUID()
  @IsNotEmpty()
  usuario_id: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsOptional()
  data_acesso_fim?: Date;
}
