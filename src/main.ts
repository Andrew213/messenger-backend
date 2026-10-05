import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppException } from '@/common/exceptions/app.exceptions.js';
import {
  ERROR_DEFINITIONS,
  ErrorCode,
} from '@/common/exceptions/error-codes.js';

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

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,

      exceptionFactory(errors) {
        const details = errors.flatMap((error) =>
          Object.values(error.constraints ?? {}).map((code) => ({
            field: error.property,
            code,
          })),
        );
        return new AppException(
          ErrorCode.ValidationError,
          ERROR_DEFINITIONS[ErrorCode.ValidationError],
          details,
        );
      },
    }),
  );

  await app.listen(port ?? 3000);
}
await bootstrap();
