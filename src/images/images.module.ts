import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './image.entity';
import { ImageProcessorService } from './image-processor.service';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';
import { LocalImagesStorageService } from './local-images-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  controllers: [ImagesController],
  providers: [ImagesService, ImageProcessorService, LocalImagesStorageService],
  exports: [ImagesService],
})
export class ImagesModule {}
