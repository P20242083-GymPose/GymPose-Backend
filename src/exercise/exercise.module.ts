import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Importa el PrismaModule
import { GlobalFunctions } from 'src/common/functions/global-function';

@Module({
  imports: [PrismaModule],
  controllers: [ExerciseController],
  providers: [ExerciseService, GlobalFunctions],
})
export class ExerciseModule {}
