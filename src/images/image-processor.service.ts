import { BadRequestException, Injectable } from '@nestjs/common';
import sharp from 'sharp';

interface ResizeOptions {
  width: number;
  height: number;
}

interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  size: number;
}

const supportedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

@Injectable()
export class ImageProcessorService {
  async process(
    file: Express.Multer.File,
    resizeOptions: ResizeOptions,
  ): Promise<ProcessedImage> {
    if (!supportedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException(
        'File must be a jpg, jpeg, png, or webp image.',
      );
    }

    try {
      const buffer = await sharp(file.buffer)
        .resize(resizeOptions.width, resizeOptions.height, {
          fit: 'cover',
          position: 'centre',
        })
        .webp({ quality: 82, effort: 4 })
        .toBuffer();

      return {
        buffer,
        mimeType: 'image/webp',
        size: buffer.length,
      };
    } catch {
      throw new BadRequestException('File must be a valid image.');
    }
  }
}
