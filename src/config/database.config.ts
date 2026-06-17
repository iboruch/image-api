import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 5432),
  user: process.env.DATABASE_USER ?? 'image_api',
  password: process.env.DATABASE_PASSWORD ?? 'image_api',
  name: process.env.DATABASE_NAME ?? 'image_api',
}));
