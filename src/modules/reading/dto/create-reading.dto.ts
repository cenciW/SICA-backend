import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { SensorType } from '@prisma/client';

export class CreateReadingDto {
  @IsEnum(SensorType)
  sensor_type!: SensorType;

  @IsNumber()
  value!: number;

  @IsString()
  @IsNotEmpty()
  unit!: string;
}
