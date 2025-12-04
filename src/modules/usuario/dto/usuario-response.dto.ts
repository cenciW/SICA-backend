import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UsuarioResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  usuario: string;

  @Expose()
  nome_completo: string;

  @Expose()
  ativo: boolean;

  @Expose()
  created_at: Date;

  @Expose()
  updated_at: Date;

  constructor(partial: Partial<UsuarioResponseDto>) {
    Object.assign(this, partial);
  }
}
