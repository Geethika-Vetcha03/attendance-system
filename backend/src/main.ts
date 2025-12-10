import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = ['http://localhost:3000'];
  if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  await app.listen(port);
  console.log('=====================================');
  console.log(`Backend running on http://localhost:${port}`);
  console.log('Database: PostgreSQL');
  console.log('  Host: localhost:5432');
  console.log('  Database: postgres');
  console.log('  Username: postgres');
  console.log('=====================================');
}
bootstrap();
