import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  @IsIn(['led', 'pump'])
  device!: 'led' | 'pump';

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'start_time deve ser HH:MM' })
  start_time!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'end_time deve ser HH:MM' })
  end_time!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}
