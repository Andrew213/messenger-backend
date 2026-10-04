import { HttpException } from '@nestjs/common';

import {
  AppErrorCode,
  ErrorDefinition,
} from '@/common/exceptions/error-codes.js';

export class AppException<
  TCode extends AppErrorCode = AppErrorCode,
> extends HttpException {
  constructor(
    public readonly code: TCode,
    definition: ErrorDefinition,
    public readonly details?: unknown,
  ) {
    super(
      {
        code,
        message: definition.message,
        details,
      },
      definition.status,
    );
  }
}
