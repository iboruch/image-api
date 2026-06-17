import { ConfigService } from '@nestjs/config';
import { ImagesService } from './images.service';
import { Image } from './image.entity';

describe('ImagesService', () => {
  it('maps an image record to public response', () => {
    const configService = {
      getOrThrow: jest.fn((key: string) => {
        const values: Record<string, string> = {
          'app.publicBaseUrl': 'http://localhost:3000/',
          'app.uploadDir': '/uploads/',
        };

        return values[key];
      }),
    } as unknown as ConfigService;
    const service = new ImagesService(configService);

    expect(
      service.toPublicResponse({
        id: '2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f',
        title: 'Sample',
        filename: 'sample.jpg',
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        size: 120000,
        createdAt: new Date('2026-06-17T00:00:00.000Z'),
        updatedAt: new Date('2026-06-17T00:00:00.000Z'),
      } satisfies Image),
    ).toEqual({
      id: '2d69d8a8-51e9-447d-a0a0-eec4a2c99b7f',
      url: 'http://localhost:3000/uploads/sample.jpg',
      title: 'Sample',
      width: 800,
      height: 600,
    });
  });
});
