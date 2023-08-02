import { SetMetadata } from '@nestjs/common';
import { userType } from '../user.entity';

export const Roles = (...roles: userType[]) => SetMetadata('roles', roles);
