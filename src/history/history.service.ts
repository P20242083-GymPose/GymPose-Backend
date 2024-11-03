import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GlobalFunctions } from 'src/common/functions/global-function';


@Injectable()
export class HistoryService {
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
          achievedGoal: createHistoryDto.achievedGoal ?? false, 
          goalToReach: createHistoryDto.goalToReach,
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

  async findByUser(paginationDto: PaginationDto, userId: number, page: number = 1, itemsPerPage: number = 20) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const skip = (page - 1) * itemsPerPage;

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

      const data = await this.prisma.history.aggregate({
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

      const history = await this.prisma.history.findMany({
        where: {
          userId: userId,
          AND: objectFilter.contains,
        },
        skip: skip,
        take: itemsPerPage,
        select: {
          id: true,
          userId: true,
          exerciseId: true,
          value: true,
          duration: true,
          rating: true,
          goal: true,
          achievedGoal: true,
          goalToReach: true,
          videoUrl: true,
          created_at: true,
          exercise: {
            select: {
              id: true,
              name: true,
              iconUrl: true,
            }
          },
        },
        orderBy: {
          created_at: 'desc', 
        },
      });
      if (history.length === 0) {
        this.resp.message = 'No more history records to load';
        this.resp.statusCode = 204;
        this.resp.data = [];
      } else {
        this.resp.message = 'History fetched successfully';
        this.resp.data = history;
      }
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  async getWeeklyAverages(userId: number, exerciseId?: number) {
    const conditions: any = {
      userId,
      deleted_at: null, 
    };
    if (exerciseId) {
      conditions.exerciseId = Number(exerciseId);
    }

    const result = await this.prisma.history.groupBy({
      by: ['created_at'],
      where: conditions,
      _avg: {
        value: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    // Format the result to group by week
    const weeklyAverages = result.reduce((acc, record) => {
      const week = this.getWeekStartDate(record.created_at);
      if (!acc[week]) {
        acc[week] = { totalValue: 0, count: 0 };
      }
      acc[week].totalValue += record._avg.value || 0;
      acc[week].count += 1;
      return acc;
    }, {});

    // Convert to an array with the week and average value
    return Object.keys(weeklyAverages).map(week => ({
      week,
      averageValue: weeklyAverages[week].totalValue / weeklyAverages[week].count,
    }));
  }
  getWeekStartDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const weekStart = new Date(d.setDate(diff));
  
    const dayStr = String(weekStart.getDate()).padStart(2, '0');
    const monthStr = String(weekStart.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const yearStr = String(weekStart.getFullYear()).slice(-2); // Get last two digits of the year
  
    return `${dayStr}/${monthStr}/${yearStr}`;
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
        select: {
          id: true,
          userId: true,
          exerciseId: true,
          value: true,
          duration: true,
          rating: true,
          goal: true,
          achievedGoal: true,
          goalToReach: true,
          videoUrl: true,
          created_at: true,
          exercise: {
            select: {
              id: true,
              name: true,
            }
          },

        },
      });
      console.log(history)
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
