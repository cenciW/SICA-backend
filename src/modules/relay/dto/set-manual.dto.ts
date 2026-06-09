import { IsIn, IsString } from 'class-validator';

export class SetManualDto {
  @IsString()
  @IsIn(['led', 'pump'])
  device!: 'led' | 'pump';

  // 'on' = forçado ligado, 'off' = forçado desligado, 'auto' = seguir schedule
  @IsString()
  @IsIn(['on', 'off', 'auto'])
  state!: 'on' | 'off' | 'auto';
}
