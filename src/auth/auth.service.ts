import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as nodemailer from 'nodemailer';

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

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        this.resp.statusCode = 404;
        this.resp.message = 'Email not found';
        this.resp.error = true;
        return this.resp;
      }

      const newPassword = this.generateRandomPassword();

      const hashedPassword = bcrypt.hashSync(newPassword);

      await this.prisma.user.update({
        where: { id: user.user.id },
        data: { password: hashedPassword },
      });

      await this.sendRecoveryEmail(email, newPassword);

      this.resp.message = 'Password reset successfully. Please check your email for the new password.';
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;
    } catch (error) {
      console.log(error);
      this.resp.statusCode = 500;
      this.resp.message = 'Internal server error';
      this.resp.error = true;
      this.resp.data = {};
    }
    return this.resp;
  }

  generateRandomPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async sendRecoveryEmail(to: string, newPassword: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 465,
      auth: {
        user: 'kendallramiro@gmail.com',
        pass: 'fgmbqiliubuqfcve',
      },
      secure: true
    });

    const mailOptions = {
      from: 'kendallramiro@gmail.com',
      to,
      subject: 'Recuperación de Contraseña',
      text: `Tu nueva contraseña es: ${newPassword}`,
    };

    await transporter.sendMail(mailOptions);
  }
}
