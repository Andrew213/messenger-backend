import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1791207792454 implements MigrationInterface {
  name = 'Init1791207792454';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" ADD "consumedAt" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "phone_verifications" DROP COLUMN "consumedAt"`,
    );
  }
}
