import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { AuthService } from '@/auth/auth.service.js';
import { SubmitCallResponseDto } from '@/auth/dto/submit-call.dto.js';
import { SubmitCodeDto } from '@/auth/dto/submit-code.dto.js';
// import { SubmitCodeDto } from '@/auth/dto/submit-code.dto.js';
import { PhoneNumberPipe } from '@/auth/pipes/phone-number.pipe.js';
import { AppSuccessResponse } from '@/types/app-response.types.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly AuthService: AuthService,
    private readonly adapterHost: HttpAdapterHost,
  ) {}
  private readonly logger = new Logger(AuthService.name);

  @Post('/call')
  submitCall(
    @Body('phoneNumber', PhoneNumberPipe) dto: string,
  ): Promise<AppSuccessResponse<SubmitCallResponseDto>> {
    this.logger.debug('POST call ', dto);

    return this.AuthService.sendCall(dto);
  }

  @Post('/code')
  @HttpCode(HttpStatus.OK)
  async submitCode(
    @Body() dto: SubmitCodeDto,
    @Body('phoneNumber', PhoneNumberPipe) phoneNumber: string,
    @Res({ passthrough: true }) res: unknown,
  ) {
    const response = await this.AuthService.sendCode({
      phoneNumber,
      code: dto.code,
    });
    this.adapterHost.httpAdapter.setCookie(res, 'token', response.data.token, {
      sameSite: 'strict',
      httpOnly: true,
      maxAge: Math.floor(
        (response.data.expiresAt.getTime() - Date.now()) / 1000,
      ),
      secure: true,
    });
    const {
      data: { token, ...cleanData },
      ...restResponse
    } = response;

    return { ...restResponse, data: cleanData };
  }
}
