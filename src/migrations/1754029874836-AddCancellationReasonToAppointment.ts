import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCancellationReasonToAppointment1754029874836 implements MigrationInterface {
    name = 'AddCancellationReasonToAppointment1754029874836'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" ADD "cancellationReason" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "cancellationReason"`);
    }

}
