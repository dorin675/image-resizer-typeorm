import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User, userType } from './user.entity';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { VerifyUserDto } from './dto/verify-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SignInUserDto } from './dto/sign-in.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserRepository) private userRepository: UserRepository,
  ) {}
  async getAllUsers() {
    return this.userRepository.find({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        type: true,
        isActive: true,
        verified: true,
        images: true,
      },
    });
  }
  public async getUserByID(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }
  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }
  async create(createUserDto: CreateUserDto) {
    const oldUser = await this.getUserByEmail(createUserDto.email);
    console.log(oldUser);
    if (oldUser) {
      throw new ConflictException('User with such an email already exists');
    }
    const hashedCode = await bcrypt.hash('banana', 10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = new User();
    newUser.firstName = createUserDto.firstName;
    newUser.lastName = createUserDto.lastName;
    newUser.email = createUserDto.email;
    newUser.password = hashedPassword;
    newUser.type = userType.USER;
    newUser.verificationCode = hashedCode;
    console.log(newUser.verificationCode);
    return await this.userRepository.save(newUser);
  }

  async matchCodes(a: string, b: string) {
    return await bcrypt.compare(a, b);
  }

  async getToken(email: string) {
    const user = await this.getUserByEmail(email);
    const SECRET_KEY = process.env.JWT_SECRET_KEY;
    const token = jwt.sign(
      {
        id: user.id,
        type: user.type,
        isActive: user.isActive,
        verified: user.verified,
      },
      SECRET_KEY,
      { expiresIn: '1h' },
    );
    return token;
  }

  async verifyUser({ email, verificationCode }: VerifyUserDto) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }
    if (user.verified) {
      throw new ConflictException('User already verified');
    }
    if (!verificationCode) {
      throw new NotFoundException('Put your erification code');
    }
    if (!this.matchCodes(verificationCode, user.verificationCode)) {
      throw new UnauthorizedException('Codes does not match');
    }
    user.verified = true;
    await this.userRepository.update(user.id, user);
    const token = await this.getToken(user.email);
    return token;
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.getUserByID(id);
    if (!user) {
      throw new NotFoundException(`Don't exist user with id:${id}`);
    }
    await this.userRepository.update(id, updateUserDto);
    return 'User Modified';
  }
  async signIn(user: SignInUserDto) {
    const currentUser = await this.getUserByEmail(user.email);
    if (!currentUser) {
      throw new NotFoundException('User Not Found');
    }
    const passwordMatch = await this.matchCodes(
      user.password,
      currentUser.password,
    );
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid Password');
    }
    return this.getToken(currentUser.email);
  }
  async remove(id: number) {
    const user = await this.getUserByID(id);
    if (!user) {
      throw new NotFoundException('User Not Found');
    }
    await this.userRepository.delete(id);
    return user;
  }
}
