import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1790872600151 implements MigrationInterface {
  name = 'Init1790872600151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" ADD "failedAttempts" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" ADD "otpHash" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" ADD "resendAvailableAt" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" ADD "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" DROP COLUMN "blockedUntil"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" ADD "blockedUntil" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" DROP COLUMN "blockedUntil"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" ADD "blockedUntil" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" DROP COLUMN "expiresAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" DROP COLUMN "resendAvailableAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" DROP COLUMN "otpHash"`,
    );
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" DROP COLUMN "failedAttempts"`,
    );
  }
}
