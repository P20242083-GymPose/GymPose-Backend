import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module'; // Importa el módulo de usuarios
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importa el PrismaModule

@Module({
  imports: [
    UsersModule, // Asegúrate de tener un módulo de usuarios
    PassportModule,
    PrismaModule,
    JwtModule.register({
      secret: 'your-secret-key', // Usa una clave secreta robusta
      signOptions: { expiresIn: '1y' }, // El token expira en 1 hora
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
