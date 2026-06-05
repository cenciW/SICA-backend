import { IsNotEmpty, IsString } from 'class-validator';

export class LinkProductDto {
  @IsString()
  @IsNotEmpty()
  code!: string;
}
