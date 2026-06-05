import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ToggleRelayDto {
  @IsString()
  @IsIn(['led', 'pump'])
  device!: 'led' | 'pump';

  @IsBoolean()
  @IsNotEmpty()
  state!: boolean;
}
