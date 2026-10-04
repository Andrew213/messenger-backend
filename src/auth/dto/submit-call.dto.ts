import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SubmitCallDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;
}

export class SubmitCallResponseDto {
  @IsNumber()
  failedAttempts!: number;

  @IsDate()
  resendAvailableAt!: Date; //Нужно для таймера повторного звонка

  @IsDate()
  blockedUntil!: Date | null;

  @IsDate()
  expiresAt!: Date | null;
}
