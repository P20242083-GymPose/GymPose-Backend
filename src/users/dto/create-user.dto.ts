import { IsOptional, IsString } from "class-validator";

export class CreateUserDto {

  @IsString()
  @IsOptional()
  email: string;
  
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  password: string;
}
