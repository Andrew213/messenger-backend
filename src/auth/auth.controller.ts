import { Body, Controller, Logger, Post } from '@nestjs/common';

import { AuthService } from '@/auth/auth.service.js';
import { SubmitCallResponseDto } from '@/auth/dto/submit-call.dto.js';
import { PhoneNumberPipe } from '@/auth/pipes/phone-number.pipe.js';
import { AppSuccessResponse } from '@/types/app-response.types.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}
  private readonly logger = new Logger(AuthService.name);

  @Post('/call')
  submitCall(
    @Body('phoneNumber', PhoneNumberPipe) dto: string,
  ): Promise<AppSuccessResponse<SubmitCallResponseDto>> {
    this.logger.debug('POST call ', dto);

    return this.AuthService.sendCall(dto);
  }
}
