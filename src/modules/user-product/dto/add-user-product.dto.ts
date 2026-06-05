import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class AddUserProductDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsIn(['OWNER', 'VIEWER'])
  role: string;
}
