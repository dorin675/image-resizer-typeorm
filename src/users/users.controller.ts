import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignInUserDto } from './dto/sign-in.dto';
import { Roles } from './decorators/roles.decorator';
import { userType } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Roles(userType.ADMIN)
  @Get('/getAllUsers')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
  @Roles(userType.ADMIN, userType.USER)
  @Get('/getUser/:id')
  async getUserByID(@Param('id') id: number) {
    return this.usersService.getUserByID(id);
  }
  @Post('/create')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @Post('/verify')
  verify(@Body() verifyUserDto: VerifyUserDto) {
    return this.usersService.verifyUser(verifyUserDto);
  }
  @Roles(userType.ADMIN, userType.USER)
  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
  @Post('/signIn')
  signIn(@Body() user: SignInUserDto) {
    return this.usersService.signIn(user);
  }
  @Roles(userType.ADMIN, userType.USER)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.remove(+id);
  }
}
