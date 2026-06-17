import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from './image.entity';
import { ImageProcessorService } from './image-processor.service';
import { LocalImagesStorageService } from './local-images-storage.service';

export interface PublicImageResponse {
  id: string;
  url: string;
  title: string;
  width: number;
  height: number;
}

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>,
    private readonly configService: ConfigService,
    private readonly imageProcessorService: ImageProcessorService,
    private readonly storageService: LocalImagesStorageService,
  ) {}

  async create(
    dto: CreateImageDto,
    file: Express.Multer.File,
  ): Promise<PublicImageResponse> {
    const width = Number(dto.width);
    const height = Number(dto.height);
    const processedImage = await this.imageProcessorService.process(file, {
      width,
      height,
    });
    const filename = await this.storageService.save(processedImage.buffer);

    const image = await this.imagesRepository.save({
      title: dto.title,
      filename,
      mimeType: processedImage.mimeType,
      width,
      height,
      size: processedImage.size,
    });

    return this.toPublicResponse(image);
  }

  toPublicResponse(image: Image): PublicImageResponse {
    const publicBaseUrl = this.configService
      .getOrThrow<string>('app.publicBaseUrl')
      .replace(/\/$/, '');
    const uploadDir = this.configService
      .getOrThrow<string>('app.uploadDir')
      .replace(/^\/|\/$/g, '');

    return {
      id: image.id,
      url: `${publicBaseUrl}/${uploadDir}/${image.filename}`,
      title: image.title,
      width: image.width,
      height: image.height,
    };
  }
}
