import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'phone_verifications', schema: 'public' })
export class PhoneVerification {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ unique: true, type: 'varchar', length: 50 })
  phoneNumber!: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  blockedUntil!: Date | null;

  @Column({ type: 'int', default: 0 })
  failedAttempts!: number;

  @Column({ type: 'varchar' })
  otpHash!: string;

  @Column({ type: 'timestamp with time zone' })
  resendAvailableAt!: Date;

  @Column({ type: 'timestamp with time zone' })
  expiresAt!: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  consumedAt!: Date | null;
}
