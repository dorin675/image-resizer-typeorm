import { IsEmail, IsString } from 'class-validator';

export class VerifyUserDto {
  @IsString()
  verificationCode: string;
  @IsEmail()
  email: string;
}
