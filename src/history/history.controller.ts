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
  async getUserReport(@Request() req, @Res() res: Response) {
    try {
      const userId = req.user.id;
      await this.historyService.generateUserReport(userId,res);

      /* res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="user_report_${userId}.pdf"`,
      });
      res.sendFile(filePath); */
    } catch (error) {
      console.error('Error fetching user report:', error);
      res.status(500).json({ message: 'Failed to generate user report' });
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
