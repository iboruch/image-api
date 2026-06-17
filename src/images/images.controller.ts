import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { CreateImageDto } from './dto/create-image.dto';
import { ListImagesQueryDto } from './dto/list-images-query.dto';
import {
  ImagesService,
  PaginatedImagesResponse,
  PublicImageResponse,
} from './images.service';

@ApiTags('images')
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  @ApiQuery({ name: 'title', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 10,
    description: 'Maximum value is 50.',
  })
  @ApiOkResponse({
    schema: {
      example: {
        data: [
          {
            id: '2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f',
            url: 'http://localhost:3000/uploads/image.webp',
            title: 'Profile photo',
            width: 800,
            height: 600,
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      },
    },
  })
  findAll(@Query() query: ListImagesQueryDto): Promise<PaginatedImagesResponse> {
    return this.imagesService.findAll(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({
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
  @ApiBadRequestResponse({ description: 'Image id must be a UUID.' })
  @ApiNotFoundResponse({ description: 'Image not found.' })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe({
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: () =>
          new BadRequestException('Image id must be a UUID.'),
      }),
    )
    id: string,
  ): Promise<PublicImageResponse> {
    return this.imagesService.findOne(id);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_request, file, callback) => {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
          callback(
            new BadRequestException(
              'File must be a jpg, jpeg, png, or webp image.',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
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
