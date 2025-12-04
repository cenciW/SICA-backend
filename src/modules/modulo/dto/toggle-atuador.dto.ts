import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleAtuadorDto {
  @IsBoolean()
  @IsNotEmpty()
  estado: boolean;
}
