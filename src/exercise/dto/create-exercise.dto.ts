import { IsOptional, IsString } from "class-validator";

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
}
