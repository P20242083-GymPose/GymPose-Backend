import { Injectable } from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GoalService {
  private resp = {
    error: false,
    message: '',
    statusCode: 200,
    data: {},
  };
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(createGoalDto: CreateGoalDto, userId: number) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const goalToDelete = await this.prisma.goal.updateMany({
        where: {
          userId: userId,
          exerciseId: createGoalDto.exerciseId,
        },
        data: {
          deleted_at: new Date(),
        }
      });
      const goal = await this.prisma.goal.create({
        data: {
          userId: userId,
          exerciseId: createGoalDto.exerciseId,
          value: createGoalDto.value,
          created_at: new Date(),
        },
      });

      this.resp.message = 'Goal created successfully';
      this.resp.data = goal;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  async findByUser(userId: number) {
    try {
      console.log("finding by user",userId)
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const goals = await this.prisma.goal.findMany({
        where: {
          userId: userId,
          deleted_at: null,
        },
      });

      this.resp.message = 'Goals fetched successfully';
      this.resp.data = goals;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  async findByExercise(userId:number, exerciseId: number) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const goals = await this.prisma.goal.findFirst({
        where: {
          userId: userId,
          exerciseId: exerciseId,
          deleted_at: null,
        },
      });

      this.resp.message = 'Goals fetched successfully';
      this.resp.data = goals;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  async findAll() {
    try{
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const goals = await this.prisma.goal.findMany();

      this.resp.message = 'Goals fetched successfully';
      this.resp.data = goals;
    }catch(error){
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  findOne(id: number) {
    return `This action returns a #${id} goal`;
  }

  async update(id: number, updateGoalDto: UpdateGoalDto) {
    try{
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const goal = await this.prisma.goal.update({
        where: {
          id: id,
        },
        data: {
          value: updateGoalDto.value,
        },
      });

      this.resp.message = 'Goal updated successfully';
      this.resp.data = goal;
    }catch(error){
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  remove(id: number) {
    return `This action removes a #${id} goal`;
  }
}
