import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  width: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  height: number;
}
