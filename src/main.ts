import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import appConfig from './config/app.config.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = appConfig().app.port;

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  await app.listen(port ?? 3000);
}
await bootstrap();
