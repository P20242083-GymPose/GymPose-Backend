import { Controller, Query, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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

  
  @Get("weekly-averages")
  @UseGuards(JwtAuthGuard)
  async getWeeklyAverages(@Request() req, @Query('exerciseId') exerciseId?: number,
  ) {
    const userId = req.user.id;
    return await this.historyService.getWeeklyAverages(userId, exerciseId);
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
