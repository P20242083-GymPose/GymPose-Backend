import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  private resp = {
    error: false,
    message: '',
    statusCode: 200,
    data: {},
  };
  constructor(
    private prisma: PrismaService,
  ) {}
  async create(createUserDto: CreateUserDto) {
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
      this.resp.message = 'User created successfully';
      this.resp.data = user;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;
      
      const user = this.prisma.user.update({
        where: { id: id },
        data: {
          name: updateUserDto.name,
          email: updateUserDto.email,
          password: bcrypt.hashSync(updateUserDto.password),
        },
      });
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.error = true;
      this.resp.data = {};
    }
    return this.resp;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
