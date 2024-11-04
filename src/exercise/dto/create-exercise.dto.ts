import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateExerciseDto {

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  iconUrl: string;

  @IsString()
  @IsOptional()
  tutorialUrl: string;

  @IsNumber()
  @IsOptional()
  level: number;
}
