import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SettingsService {
  private resp = {
    error: false,
    message: '',
    statusCode: 200,
    data: {},
  };
  constructor(
    private prisma: PrismaService,
  ) {}
  
  async create(createSettingDto: CreateSettingDto) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const setting = await this.prisma.settings.create({
        data: {
          userId: createSettingDto.userId,
          language: createSettingDto.language,
          showPopup: createSettingDto.showPopup,
          showRating: createSettingDto.showRating,
          created_at: new Date(),
        },
      });
      this.resp.message = 'Setting created successfully';
      this.resp.data = setting;
    } catch (error) {
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.error = true;
      this.resp.data = {};
    }
    return this.resp;
  }

  async findByUser(userId: number) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const setting = await this.prisma.settings.findFirst({
        where: {
          userId: userId,
        },
      });
      this.resp.message = 'Setting fetched successfully';
      this.resp.data = setting;
    } catch (error) {
      this.resp.statusCode = 400;
      this.resp.message = error;
      this.resp.error = true;
      this.resp.data = {};
      
    }
    return this.resp;
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  async update(id: number, updateSettingDto: UpdateSettingDto) {
    try {
      this.resp.data = {};
      this.resp.error = false;
      this.resp.statusCode = 200;

      const setting = await this.prisma.settings.update({
        where: {
          id: id,
        },
        data: updateSettingDto,
      });
      this.resp.message = 'Setting updated successfully';
      this.resp.data = setting;
    } catch (error) {
      this.resp.statusCode = 400;
      this.resp.error = true;
      this.resp.message = error;
      this.resp.data = {};
    }
    return this.resp;
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }
}
