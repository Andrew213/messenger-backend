import { HttpStatus } from '@nestjs/common';

import { ErrorDefinition } from '@/common/exceptions/error-codes.js';

export enum AuthErrorCode {
  OtpAttemptsExceeded = 'AUTH_OTP_ATTEMPTS_EXCEEDED',
  OtpResendTooSoon = 'AUTH_OTP_RESEND_TOO_SOON',
  OtpInvalid = 'AUTH_OTP_INVALID',
  OtpExpired = 'AUTH_OTP_EXPIRED',
}

export const AUTH_ERROR_DEFINITIONS: Record<AuthErrorCode, ErrorDefinition> = {
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
