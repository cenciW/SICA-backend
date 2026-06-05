import { IsEnum, IsISO8601, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SensorType } from '@prisma/client';

export class ReadingQueryDto {
  @IsEnum(SensorType)
  @IsOptional()
  sensor_type?: SensorType;

  @IsISO8601()
  @IsOptional()
  from?: string;

  @IsISO8601()
  @IsOptional()
  to?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
