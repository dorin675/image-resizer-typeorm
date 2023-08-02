import { IsNotEmpty, IsString } from 'class-validator';

export class UploadImageDto {
  @IsString()
  fieldname: string;
  @IsString()
  originalname: string;
  @IsString()
  mimetype: string;
  @IsNotEmpty()
  buffer: Buffer;
}
