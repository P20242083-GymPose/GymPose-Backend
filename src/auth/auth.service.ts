import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  private resp = {
    error: false,
    message: '',
    statusCode: 200,
    data: {},
  };
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.user.password)) {
      const { ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.user.email, sub: user.user.id };
    return { 
      ...user,
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: CreateUserDto){
    try{
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const user = await this.prisma.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: bcrypt.hashSync(createUserDto.password),
          created_at: new Date(),
        },
      });
      const settings = await this.prisma.settings.create({
        data: {
          userId: user.id,
          created_at: new Date(),
          language: 'es',
          showPopup: true,
          showRating: true,
        },
      });

      this.resp.message = 'User created successfully';
      this.resp.data = user;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.error = true;
      this.resp.data = {};
    }
    return this.resp;
  }
}
