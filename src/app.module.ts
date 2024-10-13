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


@Module({
  imports: [PrismaModule, UsersModule, HistoryModule, ExerciseModule, GoalModule, SettingsModule],
  controllers: [AppController],
  providers: [AppService,PrismaService],
})
export class AppModule {}
