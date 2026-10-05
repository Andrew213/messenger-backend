import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, timingSafeEqual } from 'crypto';
import { DeepPartial, Repository } from 'typeorm';

import { SubmitCallResponseDto } from '@/auth/dto/submit-call.dto.js';
import {
  SubmitCodeDto,
  SubmitCodeResponseDto,
} from '@/auth/dto/submit-code.dto.js';
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

  async sendCode(
    dto: SubmitCodeDto,
  ): Promise<AppSuccessResponse<SubmitCodeResponseDto>> {
    const { code, phoneNumber } = dto;
    const numberExist = await this.PhoneVerificationRepository.findOne({
      where: { phoneNumber },
      select: {
        otpHash: true,
        failedAttempts: true,
        resendAvailableAt: true,
        expiresAt: true,
        consumedAt: true,
        blockedUntil: true,
      },
    });

    const receiveHmac = createHmac('sha256', smsru.otpSecret)
      .update(`${phoneNumber}:${code}`)
      .digest('hex');

    if (numberExist) {
      const now = Date.now();
      if (
        numberExist.blockedUntil &&
        numberExist.blockedUntil?.getTime() > now
      ) {
        throw new AppException(
          AuthErrorCode.OtpBlockUntill,
          AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpBlockUntill],
          { blockedUntil: numberExist.blockedUntil.getTime() },
        );
      }
      if (numberExist.consumedAt !== null) {
        throw new AppException(
          AuthErrorCode.OtpExecuted,
          AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpExecuted],
        );
      }

      if (numberExist.expiresAt.getTime() <= now) {
        throw new AppException(
          AuthErrorCode.OtpExpired,
          AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpExpired],
        );
      }

      const expectedBuffer = Buffer.from(numberExist.otpHash, 'hex');
      const receivedBuffer = Buffer.from(receiveHmac, 'hex');
      const currentFailAttemps = numberExist.failedAttempts;

      if (currentFailAttemps >= 3) {
        throw new AppException(
          AuthErrorCode.OtpMaxFailedAttempt,
          AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpMaxFailedAttempt],
        );
      }

      if (
        expectedBuffer.length !== receivedBuffer.length ||
        !timingSafeEqual(expectedBuffer, receivedBuffer)
      ) {
        const nextAttemp = currentFailAttemps + 1;
        if (nextAttemp >= 3) {
          await this.PhoneVerificationRepository.update(
            { phoneNumber },
            {
              failedAttempts: nextAttemp,
              blockedUntil: new Date(now + 60 * 1000),
            },
          );
          throw new AppException(
            AuthErrorCode.OtpMaxFailedAttempt,
            AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpMaxFailedAttempt],
          );
        }
        await this.PhoneVerificationRepository.update(
          { phoneNumber },
          { failedAttempts: nextAttemp },
        );
        throw new AppException(
          AuthErrorCode.OtpInvalid,
          AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpInvalid],
        );
      } else {
        // ТУТ ОСТАНОВИЛСЯ. ОБРАБОТАТЬ УСПЕШНЫЙ ЛОГИН
        return { success: true, data: {} };
      }
    }

    throw new AppException(
      AuthErrorCode.PhoneNotFound,
      AUTH_ERROR_DEFINITIONS[AuthErrorCode.PhoneNotFound],
    );
  }
}
