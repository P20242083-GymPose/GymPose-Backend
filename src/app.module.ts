import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { HistoryModule } from './history/history.module';
import { ExerciseModule } from './exercise/exercise.module';
import { GoalModule } from './goal/goal.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { VideosModule } from './videos/videos.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MulterModule } from '@nestjs/platform-express';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    PrismaModule, HttpModule, UsersModule, HistoryModule, ExerciseModule, GoalModule, SettingsModule, AuthModule, VideosModule, MulterModule.register({
    dest: './uploads',
  }), ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'uploads'),
    serveRoot: '/uploads', // URL pública para servir archivos
  }),],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
