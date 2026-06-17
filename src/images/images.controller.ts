import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CreateImageDto } from './dto/create-image.dto';
import { ImagesService, PublicImageResponse } from './images.service';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'title', 'width', 'height'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
          example: 'Profile photo',
        },
        width: {
          type: 'integer',
          example: 800,
        },
        height: {
          type: 'integer',
          example: 600,
        },
      },
    },
  })
  @ApiCreatedResponse({
    schema: {
      example: {
        id: '2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f',
        url: 'http://localhost:3000/uploads/image.webp',
        title: 'Profile photo',
        width: 800,
        height: 600,
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid image upload request.' })
  create(
    @Body() dto: CreateImageDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<PublicImageResponse> {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    return this.imagesService.create(dto, file);
  }
}
