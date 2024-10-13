import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSettingDto {
  
  @IsNumber()
  @IsOptional()
  userId: number;

  @IsString()
  @IsOptional()
  language: string;

  @IsBoolean()
  @IsOptional()
  showPopup: boolean;

  @IsBoolean()
  @IsOptional()
  showRating: boolean;
}
