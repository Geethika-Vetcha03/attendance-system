import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://attendance-system-frontend-c2d1.onrender.com'
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  const port = process.env.PORT
    ? Number(process.env.PORT)
    : 3001;

  await app.listen(port);

  console.log('=====================================');
  console.log(`Backend running on port ${port}`);
  console.log('=====================================');
}

bootstrap();
