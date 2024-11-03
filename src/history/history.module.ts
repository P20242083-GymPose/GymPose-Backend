import { Module } from '@nestjs/common';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { GlobalFunctions } from 'src/common/functions/global-function';

@Module({
  imports: [PrismaModule],
  controllers: [HistoryController],
  providers: [HistoryService, GlobalFunctions],
})
export class HistoryModule {}
