import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsPositive, IsString, Max } from 'class-validator';

export class ListImagesQueryDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Page must be a positive integer.' })
  @IsInt({ message: 'Page must be a positive integer.' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @Max(50, { message: 'Limit must be less than or equal to 50.' })
  @IsPositive({ message: 'Limit must be a positive integer.' })
  @IsInt({ message: 'Limit must be a positive integer.' })
  limit?: number;
}
