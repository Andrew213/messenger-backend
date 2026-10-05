import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class SubmitCodeDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{4}$/, {
    message: 'Код должен состоять из 4 цифр',
  })
  code!: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber!: string;
}

export class SubmitCodeResponseDto {
  user!: {
    id: string;
  };
}
