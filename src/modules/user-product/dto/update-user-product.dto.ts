import { IsDateString, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateUserProductDto {
  @IsString()
  @IsIn(['OWNER', 'VIEWER'])
  @IsOptional()
  role?: string;

  @IsDateString()
  @IsOptional()
  access_end?: string;
}

export class UpdateUserProductConfigDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  ph_min?: number;

  @IsNumber()
  @IsOptional()
  ph_max?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ppm_min?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  ppm_max?: number;
}
