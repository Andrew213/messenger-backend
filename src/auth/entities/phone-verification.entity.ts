import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'phone_verifications', schema: 'public' })
export class PhoneVerification {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'phone_number', unique: true, type: 'varchar', length: 50 })
  phoneNumber!: string; //номер юзера

  @Column({
    name: 'blocked_until',
    type: 'timestamp with time zone',
    nullable: true,
  })
  blockedUntil!: Date | null; // блок после 3-х неправильных вводов

  @Column({
    name: 'failed_attemps',
    type: 'int',
    default: 0,
  })
  failedAttempts!: number; // кол-во неверных вводов. Будет 3

  @Column({
    name: 'otp_hash',
    type: 'varchar',
  })
  otpHash!: string; //  проверочное значение HMAC кода от смсру. Смс не хранить в открытом виде

  @Column({ type: 'timestamp with time zone' })
  resendAvailableAt!: Date | null; // начиная с этого момента можно запросить повторный звонок

  @Column({ type: 'timestamp with time zone' })
  expiresAt!: Date; // Начиная с какого момента текущий код больше не принимается, даже если пользователь его ещё не использовал.

  @Column({ type: 'timestamp with time zone', nullable: true })
  consumedAt!: Date | null; // Когда код успешно использовали. null - еще не использован, дата - повторно принимать нельзя
}
