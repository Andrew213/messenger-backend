import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import appConfig from './config/app.config.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });
  app.enableCors({
    origin: true,
    credentials: true,
  });
  const port = appConfig().app.port;
  await app.listen(port ?? 3000);
}
await bootstrap();
