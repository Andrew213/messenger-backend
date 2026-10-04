import { AppErrorCode, ErrorCode } from '@/common/exceptions/error-codes.js';

export type AppSuccessResponse<T> = {
  success: true;
  data: T;
};

export type AppErrorResponse<TCode extends AppErrorCode = ErrorCode> = {
  success: false;
  error: {
    code: TCode;
    message: string | string[];
    details?: unknown;
  };
  meta: {
    statusCode: number;
    path: string;
    timestamp: string;
  };
};

export type AppResponse<T, TCode extends AppErrorCode = ErrorCode> =
  AppSuccessResponse<T> | AppErrorResponse<TCode>;
