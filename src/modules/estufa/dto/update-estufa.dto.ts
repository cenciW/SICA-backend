import { PartialType } from '@nestjs/mapped-types';
import { CreateEstufaDto } from './create-estufa.dto';

export class UpdateEstufaDto extends PartialType(CreateEstufaDto) {}
