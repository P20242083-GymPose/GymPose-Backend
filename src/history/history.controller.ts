import { Controller, Query, Get, Res, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Response } from 'express';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createHistoryDto: CreateHistoryDto) {
    return await this.historyService.create(createHistoryDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findByUser(@Request() req, @Query() paginationDto:PaginationDto, @Query('page') page: string = '1', @Query('itemsPerPage') itemsPerPage: string = '20') {
    const userId = req.user.id;
    const pageNumber = parseInt(page, 10);
    const itemsPerPageNumber = parseInt(itemsPerPage, 10);
    return await this.historyService.findByUser(paginationDto, userId, pageNumber, itemsPerPageNumber);
  }

  @Get('report')
  @UseGuards(JwtAuthGuard)
  async getUserReportData(
    @Request() req,
    @Query('exerciseId') exerciseId?: number,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'weekly',
    @Query('day') day?: string
  ) {
    try {
      const userId = req.user.id;
  
      // Convertir el query param `day` (string) a Date si existe
      const parsedDay = day ? new Date(day) : undefined;
  
      const reportData = await this.historyService.generateUserReport(
        userId,
        exerciseId,
        period,
        parsedDay
      );

      // Si no llega exerciseId, recolectamos también promedios por cada ejercicio
      let perExerciseAverages = [];
      if (exerciseId == null) {
        perExerciseAverages = await this.historyService.getPerExerciseAverages(userId);
      }
  
      return {
        error: false,
        message: 'Report data generated successfully',
        data: {
          user: reportData.user,
          appUsage: reportData.appUsage,
          averages: reportData.averages, 
          perExerciseAverages  
        },
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      return {
        error: true,
        message: 'Failed to generate report data',
        data: {},
      };
    }
  }
  
  @Get("weekly-averages")
  @UseGuards(JwtAuthGuard)
  async getWeeklyAverages(@Request() req, @Query('exerciseId') exerciseId?: number,
  ) {
    const userId = req.user.id;
    return await this.historyService.getEnhancedWeeklyAverages(userId, exerciseId);
  }
  
  @Get("monthly-averages")
  @UseGuards(JwtAuthGuard)
  async getMonthlyAverages(@Request() req, @Query('exerciseId') exerciseId?: number,
  ) {
    const userId = req.user.id;
    return await this.historyService.getEnhancedMonthlyAverages(userId, exerciseId);
  }
  
  @Get("daily-averages")
  @UseGuards(JwtAuthGuard)
  async getDailyAverages(@Request() req, @Query('exerciseId') exerciseId?: number, @Query('day') day?: Date
  ) {
    const userId = req.user.id;
    return await this.historyService.getEnhancedDailyAverages(userId, exerciseId, day);
  }

  @Get("appUse")
  @UseGuards(JwtAuthGuard)
  async getAppUse(@Request() req) {
    const userId = req.user.id;
    return await this.historyService.getAppUse(userId);
  }

  @Patch('rating/:id')
  @UseGuards(JwtAuthGuard)
  async updateRating(@Param('id') id: string, @Body() data: any) {
    return await this.historyService.updateRating(+id, data);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return await this.historyService.findOne(+id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistoryDto: UpdateHistoryDto) {
    return this.historyService.update(+id, updateHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historyService.remove(+id);
  }
}
