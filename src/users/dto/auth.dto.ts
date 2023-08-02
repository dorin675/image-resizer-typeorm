import { userType } from '../user.entity';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class tokenData {
  @IsString()
  @IsNotEmpty()
  id?: number;
  @IsString()
  @IsEnum(userType)
  @IsNotEmpty()
  type?: userType;
  @IsBoolean()
  @IsNotEmpty()
  isActive?: boolean;
  @IsBoolean()
  @IsNotEmpty()
  verified?: boolean;
  @IsNumber()
  @IsNotEmpty()
  iat?: number;
  @IsNumber()
  @IsNotEmpty()
  exp?: number;
}
