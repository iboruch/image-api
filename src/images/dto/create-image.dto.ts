import { Transform, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateImageDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'Title is required.' })
  @IsNotEmpty({ message: 'Title is required.' })
  title: string;

  @Type(() => Number)
  @IsPositive({ message: 'Width must be a positive integer.' })
  @IsInt({ message: 'Width must be a positive integer.' })
  width: number;

  @Type(() => Number)
  @IsPositive({ message: 'Height must be a positive integer.' })
  @IsInt({ message: 'Height must be a positive integer.' })
  height: number;
}
