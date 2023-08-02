import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image.entity';
import { UsersModule } from 'src/users/users.module';
import { ImageRepository } from './image.repository';
import { UserRepository } from 'src/users/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), UsersModule],
  controllers: [ImageController],
  providers: [ImageService, ImageRepository, UserRepository],
})
export class ImageModule {}
