import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { VideosController } from './videos.controller';
import { HttpModule } from '@nestjs/axios'; 

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    HttpModule
  ],
  controllers: [VideosController],
  providers: [VideosService],
})
export class VideosModule {}
