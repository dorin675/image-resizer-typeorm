import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageRepository } from './image.repository';
import { UserRepository } from 'src/users/user.repository';
import { UploadImageDto } from './dto/upload-imagedto';
import { Image } from './image.entity';
import * as sharp from 'sharp';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageRepository) private imageRepository: ImageRepository,
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}
  async getAllImages() {
    return this.imageRepository.find({
      relations: {
        user: true,
      },
    });
  }

  async uploadImage(id: number, image: UploadImageDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('Insert Token for a valid User');
    }
    const dimensions = await sharp(image.buffer).metadata();
    const newImage = new Image();
    newImage.originalName = image.originalname;
    newImage.name = image.originalname.split('.')[0];
    newImage.buffer = image.buffer;
    newImage.mimeType = image.mimetype;
    newImage.extension = image.originalname.split('.')[1];
    newImage.width = dimensions.width;
    newImage.height = dimensions.height;
    newImage.quality = 100;
    newImage.type = 'ORIGINAL';
    newImage.user = user;
    return await this.imageRepository.save(newImage);
  }
  async getImageById(id: number) {
    const image = this.imageRepository.findOne({
      where: { id },
    });
    if (!image) {
      throw new NotFoundException(`Imaginea cu id-ul ${id} nu a fost gasita`);
    }
    return image;
  }
  findResizedImg = async (
    imageName: string,
    width: string,
    height: string,
    quality: string,
  ) => {
    return await this.imageRepository.findOne({
      where: {
        name: imageName,
        type: 'RESIZED',
        width: parseInt(width),
        height: parseInt(height),
        quality: parseInt(quality),
      },
    });
  };
  async getResizedImage(id: number, imageId: number, wxhxq: string) {
    const [width, height, quality] = wxhxq.split('x');
    if (
      isNaN(parseInt(width)) ||
      isNaN(parseInt(height)) ||
      isNaN(parseInt(quality)) ||
      parseInt(quality) <= 0 ||
      parseInt(quality) > 100
    ) {
      throw new BadRequestException('Invalid data in URL');
    }
    console.log(`width:${width}  height:${height}  quality:  ${quality}`);
    console.log(parseInt(quality) <= 0);
    const image = await this.getImageById(imageId);
    const resizedImage = await this.findResizedImg(
      image.name,
      width,
      height,
      quality,
    );
    if (resizedImage) {
      return resizedImage;
    }
    const user = await this.userRepository.findOne({ where: { id } });
    const newResizedImage = new Image();
    const resizedBuffer = await sharp(image.buffer)
      .resize(parseInt(width), parseInt(height))
      .jpeg({ quality: parseInt(quality) })
      .toBuffer();
    newResizedImage.originalName = image.originalName;
    newResizedImage.name = image.name;
    newResizedImage.buffer = resizedBuffer;
    newResizedImage.mimeType = image.mimeType;
    newResizedImage.extension = image.extension;
    newResizedImage.width = parseInt(width);
    newResizedImage.height = parseInt(height);
    newResizedImage.quality = parseInt(quality);
    newResizedImage.type = 'RESIZED';
    newResizedImage.user = user;
    console.log(resizedBuffer);
    return await this.imageRepository.save(newResizedImage);
  }
}
