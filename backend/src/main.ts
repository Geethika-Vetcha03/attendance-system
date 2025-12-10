import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Allow all localhost ports for development
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      // Allow all localhost origins
      if (origin.startsWith('http://localhost:')) return callback(null, true);
      // Allow configured frontend URL
      if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
      callback(null, false);
    },
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
