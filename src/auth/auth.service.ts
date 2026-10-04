import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac } from 'crypto';
import { DeepPartial, Repository } from 'typeorm';

import { SubmitCallResponseDto } from '@/auth/dto/submit-call.dto.js';
import { PhoneVerification } from '@/auth/entities/phone-verification.entity.js';
import {
  AUTH_ERROR_DEFINITIONS,
  AuthErrorCode,
} from '@/auth/errors/auth.errors.js';
import { SmsruCallResponse } from '@/auth/types/smsru-call-response.type.js';
import { AppException } from '@/common/exceptions/app.exceptions.js';
import {
  ERROR_DEFINITIONS,
  ErrorCode,
} from '@/common/exceptions/error-codes.js';
import appConfig from '@/config/app.config.js';
import { AppSuccessResponse } from '@/types/app-response.types.js';

const { smsru } = appConfig();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(PhoneVerification)
    private PhoneVerificationRepository: Repository<PhoneVerification>,
  ) {}

  async sendCall(
    phoneNumber: string,
  ): Promise<AppSuccessResponse<SubmitCallResponseDto>> {
    const numberExist = await this.PhoneVerificationRepository.findOne({
      where: { phoneNumber },
      select: {
        failedAttempts: true,
        resendAvailableAt: true,
        blockedUntil: true,
        expiresAt: true,
      },
    });

    if (numberExist) {
      const now = Date.now();
      if (
        numberExist.blockedUntil &&
        numberExist.blockedUntil.getTime() > now
      ) {
        const code = AuthErrorCode.OtpAttemptsExceeded;
        const definition = AUTH_ERROR_DEFINITIONS[code];
        throw new AppException(code, definition);
      }

      if (
        numberExist.resendAvailableAt &&
        numberExist.resendAvailableAt.getTime() > now
      ) {
        const code = AuthErrorCode.OtpResendTooSoon;
        const definition = AUTH_ERROR_DEFINITIONS[code];
        throw new AppException(code, definition);
      }
    }

    let responseParsed: SmsruCallResponse;
    try {
      const response = await fetch(
        `https://sms.ru/code/call?phone=${phoneNumber}&api_id=${smsru.apikey}`,
      );

      if (!response.ok) {
        throw new Error(`SMS.ru HTTP ${response.status}`);
      }

      responseParsed = await response.json();
    } catch (_) {
      const code = ErrorCode.ServiceUnavailable;
      const status = ERROR_DEFINITIONS[code];
      throw new AppException(code, status);
    }

    if (responseParsed.status === 'OK' && responseParsed.code) {
      const otpHash = createHmac('sha256', smsru.otpSecret)
        .update(`${phoneNumber}:${responseParsed.code}`)
        .digest('hex');

      const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

      const newValues: DeepPartial<PhoneVerification> = {
        phoneNumber,
        failedAttempts: 0,
        blockedUntil: null,
        otpHash,
        resendAvailableAt: expiresAt,
        expiresAt,
        consumedAt: null,
      };

      await this.PhoneVerificationRepository.upsert(newValues, ['phoneNumber']);

      return {
        success: true,
        data: {
          blockedUntil: null,
          expiresAt,
          failedAttempts: 0,
          resendAvailableAt: expiresAt,
        },
      };
    }

    const code = ErrorCode.ServiceUnavailable;
    const status = ERROR_DEFINITIONS[code];
    throw new AppException(code, status);
  }
}
