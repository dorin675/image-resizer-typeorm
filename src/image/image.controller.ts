import {
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ImageService } from './image.service';
import { Roles } from 'src/users/decorators/roles.decorator';
import { userType } from 'src/users/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}
  @Roles(userType.ADMIN)
  @Get('/getAllImages')
  async getAllImages() {
    return this.imageService.getAllImages();
  }

  @Roles(userType.ADMIN, userType.USER)
  @Post('/upload/:id')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Res() res: Response,
    @Param('id') id: number,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // const imageData = Buffer.from(file.buffer).toString('base64');
    // console.log(file);
    // return `<img src="data:${file.mimetype};base64,${imageData}" />`;
    res.set('Content-Type', 'image/jpeg');
    res.send((await this.imageService.uploadImage(id, file)).buffer);
  }
  @Roles(userType.ADMIN, userType.USER)
  @Get('/getImageById/:imageId')
  async getImageById(@Res() res: Response, @Param('imageId') imageId: number) {
    res.set('Content-Type', 'image/jpeg');
    res.send((await this.imageService.getImageById(imageId)).buffer);
  }
  @Roles(userType.ADMIN, userType.USER)
  @Post('/getResizedImage/:id/:imageId/:wxhxq')
  async getResizedImage(
    @Res() res: Response,
    @Param('id') id: number,
    @Param('imageId') imageId: number,
    @Param('wxhxq') wxhxq: string,
  ) {
    res.set('Content-Type', 'image/jpeg');
    res.send(
      (await this.imageService.getResizedImage(id, imageId, wxhxq)).buffer,
    );
  }
}
