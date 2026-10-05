import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1791217186106 implements MigrationInterface {
    name = 'Init1791217186106'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP CONSTRAINT "UQ_e5410ab84bfc47b4aca5e2a6a0d"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP COLUMN "failedAttempts"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP COLUMN "otpHash"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP COLUMN "blockedUntil"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD "phone_number" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD CONSTRAINT "UQ_039ba8620e8e2e0471f71ec0255" UNIQUE ("phone_number")`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD "blocked_until" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD "failed_attemps" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD "otp_hash" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "name" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastname" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone_number" text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone_number"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastname"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP COLUMN "otp_hash"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP COLUMN "failed_attemps"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP COLUMN "blocked_until"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP CONSTRAINT "UQ_039ba8620e8e2e0471f71ec0255"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" DROP COLUMN "phone_number"`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD "blockedUntil" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD "otpHash" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD "failedAttempts" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD "phoneNumber" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "phone_verifications" ADD CONSTRAINT "UQ_e5410ab84bfc47b4aca5e2a6a0d" UNIQUE ("phoneNumber")`);
    }

}
