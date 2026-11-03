import { createHmac } from 'node:crypto';

import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { AuthService } from '@/auth/auth.service.js';
import { SubmitCodeDto } from '@/auth/dto/submit-code.dto.js';
import { PhoneVerification } from '@/auth/entities/phone-verification.entity.js';
import {
  AUTH_ERROR_DEFINITIONS,
  AuthErrorCode,
} from '@/auth/errors/auth.errors.js';
import { AppException } from '@/common/exceptions/app.exceptions.js';
import appConfig from '@/config/app.config.js';
import { SessionService } from '@/sessions/session.service.js';
import { UsersService } from '@/users/users.service.js';

const { smsru } = appConfig();

describe('AuthService unit tests', () => {
  let service: AuthService;

  const mockPhoneVerificationRepository = {
    findOne: vi.fn(),
    update: vi.fn(),
  };

  const mockManager = {
    findOne: vi.fn(),
    update: vi.fn(),
  };

  const mockDataSource = {
    transaction: vi.fn(
      async <T>(
        callback: (manager: typeof mockManager) => Promise<T>,
      ): Promise<T> => callback(mockManager),
    ),
  };

  const mockedData: SubmitCodeDto = {
    code: '1111',
    phoneNumber: '+79999999999',
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,

        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
        {
          provide: UsersService,
          useValue: {
            findByPhoneNumer: vi.fn(),
            createUser: vi.fn(),
          },
        },
        {
          provide: SessionService,
          useValue: {
            createSession: vi.fn(),
          },
        },
        {
          provide: getRepositoryToken(PhoneVerification),
          useValue: mockPhoneVerificationRepository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('sendCode()', () => {
    it('should reject expired OTP', async () => {
      mockManager.findOne.mockResolvedValue({
        otpHash: '1111',
        failedAttempts: 0,
        resendAvailableAt: null,
        expiresAt: new Date(Date.now() - 3 * 60 * 1000),
        consumedAt: null,
        blockedUntil: null,
      });

      const promise = service.sendCode(mockedData);

      await expect(promise).rejects.toBeInstanceOf(AppException);

      await expect(promise).rejects.toMatchObject({
        code: AuthErrorCode.OtpExpired,
        message: AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpExpired].message,
      });
    });

    it('should reject if blockedUntil available', async () => {
      const mockedVerification = {
        otpHash: '1111',
        failedAttempts: 0,
        resendAvailableAt: null,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        consumedAt: null,
        blockedUntil: new Date(Date.now() + 2 * 60 * 1000),
      };
      mockManager.findOne.mockResolvedValue(mockedVerification);

      const promise = service.sendCode(mockedData);

      await expect(promise).rejects.toBeInstanceOf(AppException);

      await expect(promise).rejects.toMatchObject({
        code: AuthErrorCode.OtpBlockUntill,
        message: AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpBlockUntill].message,
        details: { blockedUntil: mockedVerification.blockedUntil.getTime() },
      });
    });

    it('should reject when enter incorrect OTP', async () => {
      const receiveHmac = createHmac('sha256', smsru.otpSecret)
        .update(`${mockedData.phoneNumber}:2222`)
        .digest('hex');
      const mockedVerification = {
        otpHash: receiveHmac,
        failedAttempts: 0,
        resendAvailableAt: null,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        consumedAt: null,
        blockedUntil: null,
      };

      mockManager.findOne.mockResolvedValue(mockedVerification);

      const promise = service.sendCode(mockedData);

      await expect(promise).rejects.toBeInstanceOf(AppException);
      await expect(promise).rejects.toMatchObject({
        code: AuthErrorCode.OtpInvalid,
        message: AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpInvalid].message,
      });

      expect(mockManager.update).toHaveBeenCalledExactlyOnceWith(
        PhoneVerification,
        { phoneNumber: mockedData.phoneNumber },
        { failedAttempts: 1 },
      );
    });

    it('should count correctly failed attempts', async () => {
      const storedOtpHash = createHmac('sha256', smsru.otpSecret)
        .update(`${mockedData.phoneNumber}:2222`)
        .digest('hex');
      const mockedVerification = {
        otpHash: storedOtpHash,
        failedAttempts: 2,
        resendAvailableAt: null,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        consumedAt: null,
        blockedUntil: null,
      };

      mockManager.findOne.mockResolvedValue(mockedVerification);

      const promise = service.sendCode(mockedData);

      await expect(promise).rejects.toMatchObject({
        code: AuthErrorCode.OtpMaxFailedAttempt,
        message:
          AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpMaxFailedAttempt].message,
      });

      expect(mockManager.update).toHaveBeenCalledWith(
        PhoneVerification,
        { phoneNumber: mockedData.phoneNumber },
        {
          failedAttempts: 3,
          blockedUntil: expect.any(Date),
        },
      );
    });

    it('should count correctly failed attempts = 3', async () => {
      const storedOtpHash = createHmac('sha256', smsru.otpSecret)
        .update(`${mockedData.phoneNumber}:2222`)
        .digest('hex');
      const mockedVerification = {
        otpHash: storedOtpHash,
        failedAttempts: 3,
        resendAvailableAt: null,
        expiresAt: new Date(Date.now() + 2 * 60 * 1000),
        consumedAt: null,
        blockedUntil: null,
      };

      mockManager.findOne.mockResolvedValue(mockedVerification);

      const promise = service.sendCode(mockedData);

      await expect(promise).rejects.toMatchObject({
        code: AuthErrorCode.OtpMaxFailedAttempt,
        message:
          AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpMaxFailedAttempt].message,
      });

      expect(mockPhoneVerificationRepository.update).not.toHaveBeenCalled();
    });

    it('should reject if consumedAt not null', async () => {
      const storedOtpHash = createHmac('sha256', smsru.otpSecret)
        .update(`${mockedData.phoneNumber}:2222`)
        .digest('hex');
      const mockedVerification = {
        otpHash: storedOtpHash,
        failedAttempts: 0,
        resendAvailableAt: null,
        expiresAt: new Date(Date.now() + 60 * 1000),
        consumedAt: new Date(Date.now() - 60 * 1000),
        blockedUntil: null,
      };

      mockManager.findOne.mockResolvedValue(mockedVerification);

      await expect(service.sendCode(mockedData)).rejects.toMatchObject({
        code: AuthErrorCode.OtpExecuted,
        message: AUTH_ERROR_DEFINITIONS[AuthErrorCode.OtpExecuted].message,
      });

      expect(mockPhoneVerificationRepository.update).not.toHaveBeenCalled();
    });

    it('should reject if phone number not found', async () => {
      mockManager.findOne.mockResolvedValue(null);

      await expect(service.sendCode(mockedData)).rejects.toMatchObject({
        code: AuthErrorCode.PhoneNotFound,
        message: AUTH_ERROR_DEFINITIONS[AuthErrorCode.PhoneNotFound].message,
      });
      expect(mockPhoneVerificationRepository.update).not.toHaveBeenCalled();
    });
  });

  describe.todo('sendCall()');
});
