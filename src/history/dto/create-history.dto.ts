import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateHistoryDto {
  @IsNumber()
  @IsOptional()
  userId: number;

  @IsNumber()
  @IsOptional()
  exerciseId: number;

  @IsNumber()
  @IsOptional()
  value: number;

  @IsString()
  @IsOptional()
  duration: string;

  @IsNumber()
  @IsOptional()
  rating: number;

  @IsNumber()
  @IsOptional()
  goal: number;

  @IsBoolean()
  @IsOptional()
  achievedGoal: boolean;

  @IsString()
  @IsOptional()
  videoUrl: string;
}
