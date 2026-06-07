import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class SetCycleDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  led_on_seconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  led_off_seconds?: number;

  @IsOptional()
  @IsBoolean()
  led_start_on?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  pump_on_seconds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  pump_off_seconds?: number;

  @IsOptional()
  @IsBoolean()
  pump_start_on?: boolean;
}
