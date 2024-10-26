import { Injectable } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { GlobalFunctions } from 'src/common/functions/global-function';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ExerciseService {
  private resp = {
    error: false,
    message: '',
    statusCode: 200,
    data: {},
  };
  constructor(
    private readonly globalFunctions: GlobalFunctions,
    private prisma: PrismaService,
  ) {}

  async create(createExerciseDto: CreateExerciseDto) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;
      const exercise = await this.prisma.exercise.create({
        data: {
          name: createExerciseDto.name,
          iconUrl: createExerciseDto.iconUrl,
          tutorialUrl: createExerciseDto.tutorialUrl,
          created_at: new Date(),
        },
      });

      this.resp.message = 'Exercise created successfully';
      this.resp.data = exercise;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      var {
        page = 1,
        limit = 1000,
        order = 'desc',
        sort = 'id',
        filter = '[]',
      } = paginationDto;

      const objectFilter = await this.globalFunctions.getObjectFilterGrid(
        sort,
        order,
        page,
        limit,
        filter,
      );

      const data = await this.prisma.exercise.aggregate({
        _count: {
          id: true,
        },
        where: {
          deleted_at: null,
          AND: objectFilter.contains,
        },
      });
      const { _count } = data;
      const pages = await this.globalFunctions.getCantPages(_count.id, limit);
      const responseFilter = await this.globalFunctions.getResponseFilter(
        limit,
        order,
        page,
        sort,
        pages,
        _count.id,
      );
      console.log("FILTROS OBJECT", objectFilter.contains)
      const exercises = await this.prisma.exercise.findMany({
        where: {
          deleted_at: null,
          AND: objectFilter.contains,
        },
      });

      this.resp.message = 'Exercise fetched successfully';
      this.resp.data = exercises;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  findOne(id: number) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const exercise = this.prisma.exercise.findUnique({
        where: {
          id: id,
        },
      });
      this.resp.message = 'Exercise finded successfully';
      this.resp.data = exercise;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  update(id: number, updateExerciseDto: UpdateExerciseDto) {
    return `This action updates a #${id} exercise`;
  }

  remove(id: number) {
    return `This action removes a #${id} exercise`;
  }
}
