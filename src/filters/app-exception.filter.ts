import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AppException } from '@/common/exceptions/app.exceptions.js';
import {
  AppErrorCode,
  ErrorCode,
  getErrorCodeByStatus,
  getErrorMessage,
} from '@/common/exceptions/error-codes.js';
import { AppErrorResponse } from '@/types/app-response.types.js';

type NestHttpExceptionResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
  code?: AppErrorCode;
  details?: unknown;
};

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      return;
    }

    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = this.getStatusCode(exception);

    // if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
    //   // Здесь потом Sentry .
    // }

    const responseBody: AppErrorResponse<AppErrorCode> = {
      success: false,
      error: this.getError(exception, statusCode),
      meta: {
        statusCode,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    };

    response.status(statusCode).json(responseBody);
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getError(
    exception: unknown,
    statusCode: number,
  ): AppErrorResponse<AppErrorCode>['error'] {
    /*
     * 1. Наше контролируемое AppException
     */
    if (exception instanceof AppException) {
      return {
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    /*
     * 2. Стандартный Nest HttpException
     */
    if (exception instanceof HttpException) {
      const exceptionResponse: unknown = exception.getResponse();

      /*
       * Например:
       *
       * throw new BadRequestException('Wrong request');
       */
      if (typeof exceptionResponse === 'string') {
        const code = getErrorCodeByStatus(statusCode);

        return {
          code,
          message: exceptionResponse,
        };
      }

      /*
       * Nest часто возвращает объект:
       *
       * {
       *   statusCode: 400,
       *   message: "...",
       *   error: "Bad Request"
       * }
       */
      if (this.isNestHttpExceptionResponse(exceptionResponse)) {
        /*
         * ValidationPipe:
         *
         * {
         *   statusCode: 400,
         *   message: [
         *     "email must be an email"
         *   ],
         *   error: "Bad Request"
         * }
         */
        if (Array.isArray(exceptionResponse.message)) {
          return {
            code: ErrorCode.ValidationError,
            message: getErrorMessage(ErrorCode.ValidationError),
            details: exceptionResponse.message,
          };
        }

        const code = exceptionResponse.code ?? getErrorCodeByStatus(statusCode);

        const fallbackCode = getErrorCodeByStatus(statusCode);

        return {
          code,
          message: exceptionResponse.message ?? getErrorMessage(fallbackCode),
          details: exceptionResponse.details,
        };
      }
    }

    /*
     * 3. Вообще неизвестная ошибка
     *
     * Например:
     * throw new Error('Database exploded')
     */
    return {
      code: ErrorCode.InternalServerError,
      message: getErrorMessage(ErrorCode.InternalServerError),
    };
  }

  private isNestHttpExceptionResponse(
    value: unknown,
  ): value is NestHttpExceptionResponse {
    return typeof value === 'object' && value !== null;
  }
}
