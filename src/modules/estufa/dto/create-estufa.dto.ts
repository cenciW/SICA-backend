import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEstufaDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  localizacao?: string;

  @IsNumber()
  @Min(0)
  largura: number;

  @IsNumber()
  @Min(0)
  altura: number;

  @IsNumber()
  @Min(0)
  comprimento: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  volume_total?: number;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  firmware_versao?: string;
}
