import { HttpStatus } from '@nestjs/common';

import { ErrorDefinition } from '@/common/exceptions/error-codes.js';

export enum AuthErrorCode {
  OtpAttemptsExceeded = 'AUTH_OTP_ATTEMPTS_EXCEEDED',
  OtpResendTooSoon = 'AUTH_OTP_RESEND_TOO_SOON',
  OtpInvalid = 'AUTH_OTP_INVALID',
  OtpExpired = 'AUTH_OTP_EXPIRED',
  PhoneNotFound = 'AUTH_OTP_NO_PHONE',
  OtpExecuted = 'AUTH_OTP_EXECUTED',
  OtpIncorrect = 'AUTH_OTP_INCORRECT',
  OtpMaxFailedAttempt = 'AUTH_OTP_MAX_ATTEMPTS',
  OtpBlockUntill = 'AUTH_OTP_BLOCK_UNTIL',
}

export const AUTH_ERROR_DEFINITIONS: Record<AuthErrorCode, ErrorDefinition> = {
  [AuthErrorCode.OtpBlockUntill]: {
    message: 'OTP Blocked until',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  },
  [AuthErrorCode.OtpMaxFailedAttempt]: {
    message: 'OTP fail attempts: 3',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  },
  [AuthErrorCode.OtpIncorrect]: {
    message: 'OTP code incorrect',
    status: HttpStatus.UNPROCESSABLE_ENTITY,
  },

  [AuthErrorCode.PhoneNotFound]: {
    message: 'Phone number was not found',
    status: HttpStatus.NOT_FOUND,
  },
  [AuthErrorCode.OtpExecuted]: {
    message: 'OTP has been executed',
    status: HttpStatus.BAD_REQUEST,
  },
  [AuthErrorCode.OtpAttemptsExceeded]: {
    message: 'Too many failed attempts',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },

  [AuthErrorCode.OtpResendTooSoon]: {
    message: 'Please wait before requesting another call',
    status: HttpStatus.TOO_MANY_REQUESTS,
  },

  [AuthErrorCode.OtpInvalid]: {
    message: 'Invalid verification code',
    status: HttpStatus.BAD_REQUEST,
  },

  [AuthErrorCode.OtpExpired]: {
    message: 'Verification code has expired',
    status: HttpStatus.BAD_REQUEST,
  },
};
