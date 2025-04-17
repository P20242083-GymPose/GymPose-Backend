import { Injectable } from '@nestjs/common';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { GlobalFunctions } from 'src/common/functions/global-function';
import PDFDocument = require('pdfkit'); // Usa require en lugar de import
import { join } from 'path';
import * as fs from 'fs';
import { Response } from 'express';
import { log } from 'console';

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
          deleted_at: null,
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

  /* async getEnhancedWeeklyAverages(userId: number, exerciseId?: number) {
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
  
    const achievedGoalResult = await this.prisma.history.groupBy({
      by: ['created_at'],
      where: {
        ...conditions,
        achievedGoal: true,
        goalToReach: { not: null },
      },
      _avg: {
        value: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  
    const weeklyAverages = result.reduce((acc, record) => {
      const week = this.getWeekStartDate(record.created_at);
      if (!acc[week]) {
        acc[week] = { totalValue: 0, count: 0 };
      }
      acc[week].totalValue += record._avg.value || 0;
      acc[week].count += 1;
      return acc;
    }, {});
  
    const achievedGoalAverages = achievedGoalResult.reduce((acc, record) => {
      const week = this.getWeekStartDate(record.created_at);
      if (!acc[week]) {
        acc[week] = { totalValue: 0, count: 0 };
      }
      acc[week].totalValue += record._avg.value || 0;
      acc[week].count += 1;
      return acc;
    }, {});
  
    const generalWeeklyAverages = Object.keys(weeklyAverages).map(week => ({
      week,
      averageValue: weeklyAverages[week].totalValue / weeklyAverages[week].count,
    }));
  
    const achievedGoalWeeklyAverages = Object.keys(achievedGoalAverages).map(week => ({
      week,
      averageValue: achievedGoalAverages[week].totalValue / achievedGoalAverages[week].count,
    }));
  
    return {
      generalWeeklyAverages,
      achievedGoalWeeklyAverages,
    };
  } */

    async getEnhancedWeeklyAverages(userId: number, exerciseId?: number) {
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
    
      const achievedGoalResult = await this.prisma.history.groupBy({
        by: ['created_at'],
        where: {
          ...conditions,
          achievedGoal: true,
          goalToReach: { not: null },
        },
        _avg: {
          value: true,
        },
        orderBy: {
          created_at: 'asc',
        },
      });
    
      const getWeekKey = (date: Date) => {
        const firstDay = new Date(date);
        firstDay.setHours(0, 0, 0, 0);
        const day = firstDay.getDay();
        const diff = firstDay.getDate() - day + (day === 0 ? -6 : 1); // Lunes como inicio
        const monday = new Date(firstDay.setDate(diff));
        return monday.toISOString().split('T')[0]; // YYYY-MM-DD
      };
    
      const weeklyTotals: Record<string, { total: number; count: number }> = {};
      const achievedTotals: Record<string, { total: number; count: number }> = {};
    
      for (const r of result) {
        const key = getWeekKey(r.created_at);
        if (!weeklyTotals[key]) weeklyTotals[key] = { total: 0, count: 0 };
        weeklyTotals[key].total += r._avg.value || 0;
        weeklyTotals[key].count += 1;
      }
    
      for (const r of achievedGoalResult) {
        const key = getWeekKey(r.created_at);
        if (!achievedTotals[key]) achievedTotals[key] = { total: 0, count: 0 };
        achievedTotals[key].total += r._avg.value || 0;
        achievedTotals[key].count += 1;
      }
    
      const generalAverages = Object.keys(weeklyTotals).map(key => ({
        key,
        value: weeklyTotals[key].total / weeklyTotals[key].count,
      }));
    
      const achievedGoalAverages = Object.keys(achievedTotals).map(key => ({
        key,
        value: achievedTotals[key].total / achievedTotals[key].count,
      }));
    
      const averageValue =
        generalAverages.length > 0
          ? generalAverages.reduce((sum, r) => sum + r.value, 0) / generalAverages.length
          : 0;
    
      const averageAchievedValue =
        achievedGoalAverages.length > 0
          ? achievedGoalAverages.reduce((sum, r) => sum + r.value, 0) / achievedGoalAverages.length
          : 0;
    
      return {
        generalAverages,
        achievedGoalAverages,
        averageValue,
        averageAchievedValue,
      };
    }
    
  
    async getEnhancedMonthlyAverages(userId: number, exerciseId?: number) {
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
    
      const achievedGoalResult = await this.prisma.history.groupBy({
        by: ['created_at'],
        where: {
          ...conditions,
          achievedGoal: true,
          goalToReach: { not: null },
        },
        _avg: {
          value: true,
        },
        orderBy: {
          created_at: 'asc',
        },
      });
    
      const getMonthKey = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
      };
    
      const monthlyTotals: Record<string, { total: number; count: number }> = {};
      const achievedTotals: Record<string, { total: number; count: number }> = {};
    
      for (const r of result) {
        const key = getMonthKey(r.created_at);
        if (!monthlyTotals[key]) monthlyTotals[key] = { total: 0, count: 0 };
        monthlyTotals[key].total += r._avg.value || 0;
        monthlyTotals[key].count += 1;
      }
    
      for (const r of achievedGoalResult) {
        const key = getMonthKey(r.created_at);
        if (!achievedTotals[key]) achievedTotals[key] = { total: 0, count: 0 };
        achievedTotals[key].total += r._avg.value || 0;
        achievedTotals[key].count += 1;
      }
    
      const generalAverages = Object.keys(monthlyTotals).map(key => ({
        key,
        value: monthlyTotals[key].total / monthlyTotals[key].count,
      }));
    
      const achievedGoalAverages = Object.keys(achievedTotals).map(key => ({
        key,
        value: achievedTotals[key].total / achievedTotals[key].count,
      }));
    
      const averageValue =
        generalAverages.length > 0
          ? generalAverages.reduce((sum, r) => sum + r.value, 0) / generalAverages.length
          : 0;
    
      const averageAchievedValue =
        achievedGoalAverages.length > 0
          ? achievedGoalAverages.reduce((sum, r) => sum + r.value, 0) / achievedGoalAverages.length
          : 0;
    
      return {
        generalAverages,
        achievedGoalAverages,
        averageValue,
        averageAchievedValue,
      };
    }
    
  
  async getEnhancedDailyAverages(userId: number, exerciseId?: number, date?: Date) {
    const localDate = date ? new Date(date) : new Date();

    console.log("FECHA LOCAL", localDate)
  
    // Calculamos los límites en UTC equivalentes al día local (UTC-5)
    const utcOffsetInMs = 5 * 60 * 60 * 1000;
  
    const utcStart = new Date(localDate);
    utcStart.setUTCHours(5, 0, 0, 0); // 5am UTC = 00:00 hora local
  
    const utcEnd = new Date(utcStart);
    utcEnd.setUTCHours(utcEnd.getUTCHours() + 24); // siguiente día a las 5am UTC
  
    const conditions: any = {
      userId,
      deleted_at: null,
      created_at: {
        gte: utcStart,
        lt: utcEnd, // usamos lt en lugar de lte para evitar colisión con el siguiente día
      },
    };
    console.log("CONDITIONS", conditions)
  
    if (exerciseId) {
      conditions.exerciseId = Number(exerciseId);
    }
  
    const entries = await this.prisma.history.findMany({
      where: conditions,
      select: {
        value: true,
        created_at: true,
        achievedGoal: true,
        goalToReach: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  
    // Para mostrar hora local, restamos 5h a los timestamps
    const generalAverages = entries.map(entry => ({
      key: new Date(entry.created_at.getTime()).toTimeString().slice(0, 5),
      value: entry.value || 0,
    }));
  
    const achievedGoalAverages = entries
      .filter(entry => entry.achievedGoal && entry.goalToReach !== null)
      .map(entry => ({
        key: new Date(entry.created_at.getTime()).toTimeString().slice(0, 5),
        value: entry.value || 0,
      }));
  
    const averageValue =
      generalAverages.length > 0
        ? generalAverages.reduce((sum, r) => sum + r.value, 0) / generalAverages.length
        : 0;
  
    const averageAchievedValue =
      achievedGoalAverages.length > 0
        ? achievedGoalAverages.reduce((sum, r) => sum + r.value, 0) / achievedGoalAverages.length
        : 0;
  
    return {
      generalAverages,
      achievedGoalAverages,
      averageValue,
      averageAchievedValue,
    };
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
  async updateRating(id: number, data: any) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const history = await this.prisma.history.update({
        where: { id: id },
        data: {
          rating: data.rating,
        },
      });
      this.resp.message = 'Rating updated successfully';
      this.resp.data = history;
    } catch (error) {
      console.log(error)
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  async getAppUse(userId: number) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;
  
      const historyRecords = await this.prisma.history.findMany({
        where: { userId },
      });
  
      if (historyRecords.length === 0) {
        this.resp.message = 'No records found for the user';
        this.resp.data = {
          averageImprovement: 0,
          totalTime: '00:00',
          exerciseCount: 0,
        };
        return this.resp;
      }
  
      const totalValue = historyRecords.reduce((sum, record) => sum + record.value, 0);
      const averageImprovement = (totalValue / historyRecords.length).toFixed(2);
  
      const totalDuration = historyRecords.reduce((sum, record) => {
        const durationInSeconds = parseFloat(record.duration.replace('s', ''));
        return sum + durationInSeconds;
      }, 0);
  
      const minutes = Math.floor(totalDuration / 60);
      const seconds = Math.floor(totalDuration % 60);
      const totalTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
      const exerciseCount = historyRecords.length;
  
      this.resp.message = 'App use fetched successfully';
      this.resp.data = {
        averageImprovement: `${averageImprovement}%`,
        totalTime,
        exerciseCount,
      };
    } catch (error) {
      console.log(error);
      this.resp.statusCode = 400;
      this.resp.message = 'Error fetching app use data';
      this.resp.data = {};
    }
  
    return this.resp;
  }
  
  async generateUserReport(userId: number, res: Response, exerciseId?: number): Promise<void> {
    try {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                goals: true,
            }
        });

        const appUsage: any = await this.getAppUse(userId); // Obtén los datos de uso
        const weeklyAverages = await this.getWeeklyAverages(userId, exerciseId); // Obtén los avances del usuario

        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            // Configura las cabeceras para la respuesta
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="user_report_${userId}.pdf"`);
            res.send(pdfBuffer); // Envía el PDF como respuesta
        });

        // Encabezado
        doc.fontSize(20).text('User Report', { align: 'center' });
        doc.moveDown();

        // Información del usuario
        doc.fontSize(14).text('User Information:', { underline: true });
        doc.fontSize(12).text(`Name: ${user.name}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`User ID: ${user.id}`);
        doc.moveDown();

        // Información de uso de la app
        doc.fontSize(14).text('App Usage Information:', { underline: true });
        doc.fontSize(12).text(`Average Improvement: ${appUsage.data.averageImprovement}`);
        doc.text(`Total Exercise Time: ${appUsage.data.totalTime}`);
        doc.text(`Exercise Count: ${appUsage.data.exerciseCount}`);
        doc.moveDown();

        // Avances del usuario
        doc.fontSize(14).text('User Progress:', { underline: true });
        weeklyAverages.forEach((week, index) => {
            doc.fontSize(12).text(`Week ${index + 1} (${week.week}): ${week.averageValue.toFixed(2)}% improvement`);
        });
        doc.moveDown();

        // Cierre
        doc.fontSize(14).text('Summary:', { underline: true });
        doc.fontSize(12).text('This report highlights the user’s progress and app usage.');
        doc.text('Keep working towards your goals!');
        
        // Finaliza y envía el PDF
        doc.end();
    } catch (error) {
        console.error('Error generating report:', error);
        throw new Error('Failed to generate report');
    }
}

  update(id: number, updateHistoryDto: UpdateHistoryDto) {
    return `This action updates a #${id} history`;
  }

  remove(id: number) {
    return `This action removes a #${id} history`;
  }
}
