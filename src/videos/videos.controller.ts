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
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegPath from 'ffmpeg-static';
import * as path from 'path';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as FormData from 'form-data';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';

ffmpeg.setFfmpegPath(ffmpegPath);

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService, private readonly httpService: HttpService, private readonly configService: ConfigService) {}

  @Post('trim')
  @UseInterceptors(FileInterceptor('video'))
  async trimVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('start') start: string,
    @Body('duration') duration: string,
    @Body('exerciseName') exerciseName: string,
  ): Promise<{ trimmedVideoFilename: string; score: number }> {
    const inputPath = file.path;
    const fileName = `trimmed_${Date.now()}.mp4`;
    const outputPath = path.join(__dirname, '..', '..', 'uploads', fileName);

    const processVideo = (): Promise<void> => {
      return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(start)
          .setDuration(duration)
          .noAudio()
          .videoCodec('libx264') 
          .outputOptions([
            '-preset ultrafast',   
            '-crf 32',           
            '-pix_fmt yuv420p', 
            '-movflags +faststart',
            '-tune zerolatency'
          ])
          .output(outputPath)
          .on('end', () => {
            fs.unlinkSync(inputPath); 
            resolve();
          })
          .on('error', (err) => {
            reject(err);
          })
          .run();
      });
    };
    
    const sendToMicroservice = async (): Promise<number> => {
      const form = new (require('form-data'))();
      form.append('video', fs.createReadStream(outputPath), {
        filename: fileName,
        contentType: 'video/mp4',
      });
  
      const baseUrl = this.configService.get<string>('API_MODEL_URL');
      const apiUrl = `${baseUrl}/get-score-${exerciseName}`;
  
      try {
        const response = await firstValueFrom(
          this.httpService.post(apiUrl, form, {
            headers: form.getHeaders(),
          })
        );
        const result = response.data as { score: string | number };
        return Math.round(parseFloat(result.score.toString()) * 100);
      } catch (error) {
        console.error('Error calling microservice:', error.response?.data || error.message);
        
        throw new HttpException(
          error.response?.data?.error || 'Error al obtener score del microservicio',
          error.response?.status || 500,
        );
      }
    };
  
    try {
      await processVideo();
      console.log('Video trimmed and saved to:', outputPath);
      const score = await sendToMicroservice();
  
      return {
        trimmedVideoFilename: fileName,
        score,
      };
    } catch (error) {
      console.error('Error in trimVideo:', error);
      throw error; 
    }
  }

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
    const videoPath = join(__dirname, '..', '..', 'uploads', `${name}.mp4`);
    if (!existsSync(videoPath)) {
      return res.status(404).send('Video not found');
    }
    res.set({
      'Content-Type': 'video/mp4',
      'Content-Disposition': `inline; filename="${name}.mp4"`,
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
