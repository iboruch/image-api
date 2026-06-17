import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Image } from './image.entity';

export interface PublicImageResponse {
  id: string;
  url: string;
  title: string;
  width: number;
  height: number;
}

@Injectable()
export class ImagesService {
  constructor(private readonly configService: ConfigService) {}

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
