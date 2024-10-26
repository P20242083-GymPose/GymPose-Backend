import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Injectable, Res } from '@nestjs/common';
import { VideosService } from './videos.service';
import { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as multer from 'multer';
import { Express } from 'express'; 
import { join } from 'path';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))

  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'Video subido correctamente',
      filePath: `/uploads/${file.filename}`,
    };
  }

  @Get(':name')
  async getVideo(@Param('name') name: string, @Res() res: Response) {
    const videoPath = join(__dirname, '..', '..', 'uploads', `${name}.webm`);
    if (!existsSync(videoPath)) {
      return res.status(404).send('Video not found');
    }
    res.set({
      'Content-Type': 'video/webm',
      'Content-Disposition': `inline; filename="${name}.webm"`,
    });
    const videoStream = createReadStream(videoPath);
    videoStream.pipe(res);
  }

  @Get()
  findAll() {
    return this.videosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videosService.update(+id, updateVideoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videosService.remove(+id);
  }
}
