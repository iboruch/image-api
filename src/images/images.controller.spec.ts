import {
  BadRequestException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { ArgumentMetadata } from '@nestjs/common/interfaces';
import { CreateImageDto } from './dto/create-image.dto';
import { ListImagesQueryDto } from './dto/list-images-query.dto';
import {
  imageIdPipe,
  ImagesController,
  supportedImageFileFilter,
} from './images.controller';
import { ImagesService } from './images.service';

describe('ImagesController', () => {
  const imageResponse = {
    id: '2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f',
    url: 'http://localhost:3000/uploads/sample.webp',
    title: 'Sample',
    width: 800,
    height: 600,
  };
  const service = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<ImagesService>;
  const controller = new ImagesController(service);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists images with pagination', async () => {
    service.findAll.mockResolvedValue({
      data: [imageResponse],
      meta: {
        page: 2,
        limit: 5,
        total: 6,
        totalPages: 2,
      },
    });

    await expect(controller.findAll({ page: 2, limit: 5 })).resolves.toEqual({
      data: [imageResponse],
      meta: {
        page: 2,
        limit: 5,
        total: 6,
        totalPages: 2,
      },
    });
    expect(service.findAll).toHaveBeenCalledWith({ page: 2, limit: 5 });
  });

  it('passes the title filter to the service', async () => {
    service.findAll.mockResolvedValue({
      data: [imageResponse],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    await controller.findAll({ title: 'samp' });

    expect(service.findAll).toHaveBeenCalledWith({ title: 'samp' });
  });

  it('gets an image by id', async () => {
    service.findOne.mockResolvedValue(imageResponse);

    await expect(controller.findOne(imageResponse.id)).resolves.toEqual(
      imageResponse,
    );
    expect(service.findOne).toHaveBeenCalledWith(imageResponse.id);
  });

  it('returns not found errors from the service', async () => {
    service.findOne.mockRejectedValue(new NotFoundException('Image not found.'));

    await expect(
      controller.findOne('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow('Image not found.');
  });

  it('rejects malformed image ids', async () => {
    await expect(
      imageIdPipe.transform('not-a-uuid', {
        type: 'param',
        metatype: String,
        data: 'id',
      }),
    ).rejects.toThrow('Image id must be a UUID.');
  });

  it('rejects invalid pagination values', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    });

    await expect(
      pipe.transform(
        { limit: '51' },
        {
          type: 'query',
          metatype: ListImagesQueryDto,
          data: '',
        } satisfies ArgumentMetadata,
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects uploads without a file', () => {
    expect(() =>
      controller.create({
        title: 'Sample',
        width: 800,
        height: 600,
      }),
    ).toThrow('File is required.');
    expect(service.create).not.toHaveBeenCalled();
  });

  it('rejects unsupported upload file types', () => {
    const callback = jest.fn();

    supportedImageFileFilter(
      {},
      { mimetype: 'text/plain' } as Express.Multer.File,
      callback,
    );

    expect(callback).toHaveBeenCalledWith(expect.any(BadRequestException), false);
    expect(callback.mock.calls[0][0].message).toBe(
      'File must be a jpg, jpeg, png, or webp image.',
    );
  });

  it('validates multipart upload fields after string conversion', async () => {
    const pipe = new ValidationPipe({
      transform: true,
      stopAtFirstError: true,
    });

    await expect(
      pipe.transform(
        {
          title: 'Sample',
          width: '0',
          height: '600',
        },
        {
          type: 'body',
          metatype: CreateImageDto,
          data: '',
        } satisfies ArgumentMetadata,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});
