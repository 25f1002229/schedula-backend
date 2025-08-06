import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveBufferColumns1753251833142 implements MigrationInterface {
  name = 'RemoveBufferColumns1753251833142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "doctor_timeslot" DROP COLUMN "bufferAfter"`);
    await queryRunner.query(`ALTER TABLE "doctor_availability" DROP COLUMN "bufferAfterMinutes"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Optional: reverse changes for rollback
    await queryRunner.query(`ALTER TABLE "doctor_availability" ADD "bufferAfterMinutes" integer`);
    await queryRunner.query(`ALTER TABLE "doctor_timeslot" ADD "bufferAfter" integer NOT NULL DEFAULT 0`);
  }
}
