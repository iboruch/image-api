import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Image } from './image.entity';
import { ImageProcessorService } from './image-processor.service';
import { ImagesService } from './images.service';
import { LocalImagesStorageService } from './local-images-storage.service';

describe('ImagesService', () => {
  const configService = {
    getOrThrow: jest.fn((key: string) => {
      const values: Record<string, string> = {
        'app.publicBaseUrl': 'http://localhost:3000/',
        'app.uploadDir': '/uploads/',
      };

      return values[key];
    }),
  } as unknown as ConfigService;

  const sampleImage = {
    id: '2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f',
    title: 'Sample',
    filename: 'sample.jpg',
    mimeType: 'image/jpeg',
    width: 800,
    height: 600,
    size: 120000,
    createdAt: new Date('2026-06-17T00:00:00.000Z'),
    updatedAt: new Date('2026-06-17T00:00:00.000Z'),
  } satisfies Image;

  function createService(repository: Partial<Repository<Image>> = {}) {
    return new ImagesService(
      repository as Repository<Image>,
      configService,
      {} as ImageProcessorService,
      {} as LocalImagesStorageService,
    );
  }

  it('maps an image record to public response', () => {
    const service = createService();

    expect(
      service.toPublicResponse(sampleImage),
    ).toEqual({
      id: '2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f',
      url: 'http://localhost:3000/uploads/sample.jpg',
      title: 'Sample',
      width: 800,
      height: 600,
    });
  });

  it('returns paginated images with defaults', async () => {
    const queryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[sampleImage], 1]),
    };
    const service = createService({
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    });

    await expect(service.findAll({})).resolves.toEqual({
      data: [service.toPublicResponse(sampleImage)],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(10);
    expect(queryBuilder.where).not.toHaveBeenCalled();
  });

  it('filters images by title and applies pagination', async () => {
    const queryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[sampleImage], 12]),
    };
    const service = createService({
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    });

    const result = await service.findAll({
      title: ' sample ',
      page: 2,
      limit: 5,
    });

    expect(result.meta).toEqual({
      page: 2,
      limit: 5,
      total: 12,
      totalPages: 3,
    });
    expect(queryBuilder.skip).toHaveBeenCalledWith(5);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'image.title ILIKE :title',
      { title: '%sample%' },
    );
  });

  it('returns one image by id', async () => {
    const service = createService({
      findOne: jest.fn().mockResolvedValue(sampleImage),
    });

    await expect(service.findOne(sampleImage.id)).resolves.toEqual(
      service.toPublicResponse(sampleImage),
    );
  });

  it('throws not found when an image does not exist', async () => {
    const service = createService({
      findOne: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.findOne('00000000-0000-0000-0000-000000000000'),
    ).rejects.toThrow('Image not found.');
  });
});
