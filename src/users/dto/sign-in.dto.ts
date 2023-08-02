import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class SignInUserDto extends OmitType(CreateUserDto, [
  'firstName',
  'lastName',
] as const) {}
