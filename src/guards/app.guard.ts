import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { ImageRepository } from 'src/image/image.repository';
import { tokenData } from 'src/users/dto/auth.dto';
import { userType } from 'src/users/user.entity';
import { UserRepository } from 'src/users/user.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userRepository: UserRepository,
    private imageRepository: ImageRepository,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (roles?.length) {
      const request = context.switchToHttp().getRequest();
      const token = request.headers?.authorization;
      const body = request.body?.id;
      const param = request.params?.id;
      const imageId = request.params?.imageId;
      try {
        const payload: tokenData = jwt.verify(
          token,
          process.env.JWT_SECRET_KEY,
        ) as jwt.JwtPayload;
        const id: number = payload.id;
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
          return false;
        }
        if (!user.isActive || !user.verified) {
          return false;
        }
        if (user.type === userType.USER) {
          // console.log(body, param);
          // console.log(user.id);
          if (user.id == body || user.id == param) {
            return true;
          }
          // console.log(`image id ${imageId}`);
          if (imageId) {
            const image = await this.imageRepository.findOne({
              where: { id: imageId },
              relations: {
                user: true,
              },
            });
            // console.log(image.user);
            if (image.user.id == user.id) {
              console.log(image.user.id);
              return true;
            }
            return false;
          }
          return false;
        }
        if (roles.includes(user.type)) {
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    }
    return true;
  }
}
