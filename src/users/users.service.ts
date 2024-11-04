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

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
        deleted_at: null,
      },
    });
    const settings = await this.prisma.settings.findMany({
      where: {
        userId: user.id,
        deleted_at: null,
      },
    });
    return {user, settings};
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;
      console.log("id y datos", id, updateUserDto)
      const actualUser = await this.prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      const user = await this.prisma.user.update({
        where: { id: id },
        data: {
          name: updateUserDto.name ? updateUserDto.name : actualUser.name,
          email: updateUserDto.email ? updateUserDto.email : actualUser.email,
          password: updateUserDto.password ? bcrypt.hashSync(updateUserDto.password) : actualUser.password,
          updated_at: new Date(),
        },
      });
      console.log("user", user)
      return user;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.error = true;
      this.resp.data = {};
    }
    return this.resp;
  }

  async remove(id: number) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const user = await this.prisma.user.delete({
        where: { id: id },
      });
      const settings = await this.prisma.settings.deleteMany({
        where: { userId: id },
      });
      this.resp.message = 'User deleted successfully';
      this.resp.data = user;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.error = true;
      this.resp.data = {};
    }
  }
}
