import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Allows the frontend to make requests
  await app.listen(process.env.PORT ?? 3001); // Ensures backend runs on 3001
}
await bootstrap();
