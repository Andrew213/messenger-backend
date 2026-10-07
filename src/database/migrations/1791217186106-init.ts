import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1791217186106 implements MigrationInterface {
  name = 'Init1791217186106';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "phone_verifications"
      RENAME COLUMN "phoneNumber" TO "phone_number"
    `);

    await queryRunner.query(`
      ALTER TABLE "phone_verifications"
      RENAME COLUMN "failedAttempts" TO "failed_attempts"
    `);

    await queryRunner.query(`
      ALTER TABLE "phone_verifications"
      RENAME COLUMN "otpHash" TO "otp_hash"
    `);

    await queryRunner.query(`
      ALTER TABLE "phone_verifications"
      RENAME COLUMN "blockedUntil" TO "blocked_until"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD "name" text
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD "lastname" text
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD "phone_number" text NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "phone_number"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "lastname"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN "name"
    `);

    await queryRunner.query(`
      ALTER TABLE "phone_verifications"
      RENAME COLUMN "blocked_until" TO "blockedUntil"
    `);

    await queryRunner.query(`
      ALTER TABLE "phone_verifications"
      RENAME COLUMN "otp_hash" TO "otpHash"
    `);

    await queryRunner.query(`
      ALTER TABLE "phone_verifications"
      RENAME COLUMN "failed_attempts" TO "failedAttempts"
    `);

    await queryRunner.query(`
      ALTER TABLE "phone_verifications"
      RENAME COLUMN "phone_number" TO "phoneNumber"
    `);
  }
}
