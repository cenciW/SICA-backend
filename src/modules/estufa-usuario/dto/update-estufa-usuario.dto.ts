import { PartialType } from '@nestjs/mapped-types';
import { CreateEstufaUsuarioDto } from './create-estufa-usuario.dto';

export class UpdateEstufaUsuarioDto extends PartialType(CreateEstufaUsuarioDto) {}
