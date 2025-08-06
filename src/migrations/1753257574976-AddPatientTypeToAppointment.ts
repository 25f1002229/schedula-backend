import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPatientTypeToAppointment1753257574976 implements MigrationInterface {
    name = 'AddPatientTypeToAppointment1753257574976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."appointment_patienttype_enum" AS ENUM('new', 'follow_up')`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "patientType" "public"."appointment_patienttype_enum" NOT NULL DEFAULT 'new'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "patientType"`);
        await queryRunner.query(`DROP TYPE "public"."appointment_patienttype_enum"`);
    }

}
