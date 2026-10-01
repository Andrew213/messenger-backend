import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1790872499525 implements MigrationInterface {
    name = 'Init1790872499525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "phone_verifications" ("id" SERIAL NOT NULL, "phoneNumber" character varying(50) NOT NULL, "blockedUntil" TIMESTAMP NOT NULL, CONSTRAINT "UQ_e5410ab84bfc47b4aca5e2a6a0d" UNIQUE ("phoneNumber"), CONSTRAINT "PK_11ef2c1c5ed828b9636472db666" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "phone_verifications"`);
    }

}
