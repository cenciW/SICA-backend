import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  username!: string;

  @Expose()
  full_name!: string;

  @Expose()
  role!: string;

  @Expose()
  active!: boolean;

  @Expose()
  created_at!: Date;

  @Expose()
  updated_at!: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
