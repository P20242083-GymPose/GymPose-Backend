import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HistoryService {
  private resp = {
    error: false,
    message: '',
    statusCode: 200,
    data: {},
  };
  constructor(
    private prisma: PrismaService,
  ) {}
  
  async create(createHistoryDto: CreateHistoryDto) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const history = await this.prisma.history.create({
        data: {
          userId: createHistoryDto.userId,
          exerciseId: createHistoryDto.exerciseId,
          value: createHistoryDto.value,
          duration: createHistoryDto.duration,
          rating: createHistoryDto.rating,
          goal: createHistoryDto.goal,
          achievedGoal: createHistoryDto.achievedGoal,
          videoUrl: createHistoryDto.videoUrl,
          created_at: new Date(),
        },
      });
      this.resp.message = 'History created successfully';
      this.resp.data = history;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp
  }

  async findByUser(userId: number) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const history = await this.prisma.history.findMany({
        where: {
          userId: userId,
        },
      });
      this.resp.message = 'History fetched successfully';
      this.resp.data = history;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  async findOne(id: number) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const history = await this.prisma.history.findUnique({
        where: {
          id: id,
        },
      });
      this.resp.message = 'History finded successfully';
      this.resp.data = history;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  update(id: number, updateHistoryDto: UpdateHistoryDto) {
    return `This action updates a #${id} history`;
  }

  remove(id: number) {
    return `This action removes a #${id} history`;
  }
}
