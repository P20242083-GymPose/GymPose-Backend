import { IsNumber, IsOptional } from "class-validator";

export class CreateGoalDto {
  
  @IsNumber()
  @IsOptional()
  userId: number;

  @IsNumber()
  @IsOptional()
  exerciseId: number;

  @IsNumber()
  @IsOptional()
  value: number;
}
