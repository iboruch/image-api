import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';

@Injectable()
export class LocalImagesStorageService {
  constructor(private readonly configService: ConfigService) {}

  async save(buffer: Buffer): Promise<string> {
    const filename = `${randomUUID()}.webp`;
    const uploadDir = this.configService.getOrThrow<string>('app.uploadDir');
    const uploadPath = isAbsolute(uploadDir)
      ? uploadDir
      : join(process.cwd(), uploadDir);

    await mkdir(uploadPath, { recursive: true });
    await writeFile(join(uploadPath, filename), buffer);

    return filename;
  }

  // Local storage can be replaced later with S3-compatible storage:
  // await s3Client.send(new PutObjectCommand({
  //   Bucket: bucketName,
  //   Key: filename,
  //   Body: buffer,
  //   ContentType: 'image/webp',
  // }));
}
