import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import parsePhoneNumberFromString from 'libphonenumber-js';

@Injectable()
export class PhoneNumberPipe implements PipeTransform<unknown, string> {
  transform(value: unknown): string {
    if (typeof value !== 'string') {
      throw new BadRequestException('Phone number should be a string');
    }

    const phone = value.trim();

    if (!phone.startsWith('+')) {
      throw new BadRequestException(
        'Enter the number with the international code',
      );
    }

    const phoneNumber = parsePhoneNumberFromString(phone, {
      extract: false,
    });

    if (!phoneNumber?.isValid()) {
      throw new BadRequestException('The number is not valid');
    }

    return phoneNumber.number;
  }
}
