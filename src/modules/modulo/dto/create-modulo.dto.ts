import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export enum ModuloTipo {
  CO2 = 'CO2',
  IRRIGACAO = 'IRRIGACAO',
  ILUMINACAO = 'ILUMINACAO',
  CLIMA = 'CLIMA',
  NUTRICAO = 'NUTRICAO',
}

export class CreateModuloDto {
  @IsString()
  @IsNotEmpty()
  estufaId: string;

  @IsEnum(ModuloTipo)
  tipo: ModuloTipo;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;

  @IsObject()
  @IsOptional()
  configuracao?: Record<string, any>;
}
