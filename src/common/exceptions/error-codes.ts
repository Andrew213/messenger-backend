import { HttpStatus } from '@nestjs/common';

export type AppErrorCode = string | number;

/**
 * Только общие ошибки.
 */
export enum ErrorCode {
  ValidationError = 200,

  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  Conflict = 409,

  InternalServerError = 500,
  ServiceUnavailable = 503,
}

/**
 * По HTTP status определяем fallback common-код.
 */
const STATUS_TO_ERROR_CODE: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BadRequest,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.Unauthorized,
  [HttpStatus.FORBIDDEN]: ErrorCode.Forbidden,
  [HttpStatus.NOT_FOUND]: ErrorCode.NotFound,
  [HttpStatus.CONFLICT]: ErrorCode.Conflict,
  [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.InternalServerError,
  [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.ServiceUnavailable,
};

/**
 * Описание любой контролируемой ошибки.
 */
export type ErrorDefinition = {
  message: string;
  status: HttpStatus;
};

/**
 * Описания только COMMON ошибок.
 */
export const ERROR_DEFINITIONS: Record<ErrorCode, ErrorDefinition> = {
  [ErrorCode.ValidationError]: {
    message: 'Validation failed',
    status: HttpStatus.BAD_REQUEST,
  },

  [ErrorCode.BadRequest]: {
    message: 'Bad request',
    status: HttpStatus.BAD_REQUEST,
  },

  [ErrorCode.Unauthorized]: {
    message: 'Unauthorized',
    status: HttpStatus.UNAUTHORIZED,
  },

  [ErrorCode.Forbidden]: {
    message: 'Forbidden',
    status: HttpStatus.FORBIDDEN,
  },

  [ErrorCode.NotFound]: {
    message: 'Not found',
    status: HttpStatus.NOT_FOUND,
  },

  [ErrorCode.Conflict]: {
    message: 'Conflict',
    status: HttpStatus.CONFLICT,
  },

  [ErrorCode.InternalServerError]: {
    message: 'Internal server error',
    status: HttpStatus.INTERNAL_SERVER_ERROR,
  },
  [ErrorCode.ServiceUnavailable]: {
    message: 'Service unavailable',
    status: HttpStatus.SERVICE_UNAVAILABLE,
  },
};

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_DEFINITIONS[code].message;
}

export function getErrorStatus(code: ErrorCode): HttpStatus {
  return ERROR_DEFINITIONS[code].status;
}

export function getErrorCodeByStatus(status: number): ErrorCode {
  return STATUS_TO_ERROR_CODE[status] ?? ErrorCode.InternalServerError;
}
