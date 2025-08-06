import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStartAndEndTimeToAvailability1753175738480 implements MigrationInterface {
    name = 'AddStartAndEndTimeToAvailability1753175738480'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_5ce4c3130796367c93cd817948e"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_b463fce395ead7791607a5c33eb"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP CONSTRAINT "FK_doctor_user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_doctor_userId"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP COLUMN "timeSlots"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD "startTime" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD "endTime" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ALTER COLUMN "slotDuration" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_5ce4c3130796367c93cd817948e" FOREIGN KEY ("patientId") REFERENCES "patient"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_b463fce395ead7791607a5c33eb" FOREIGN KEY ("slotId") REFERENCES "doctor_timeslot"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD CONSTRAINT "FK_e573a17ab8b6eea2b7fe9905fa8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" DROP CONSTRAINT "FK_e573a17ab8b6eea2b7fe9905fa8"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_b463fce395ead7791607a5c33eb"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_5ce4c3130796367c93cd817948e"`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ALTER COLUMN "slotDuration" SET DEFAULT '15'`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP COLUMN "endTime"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP COLUMN "startTime"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD "timeSlots" jsonb NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_doctor_userId" ON "doctor" ("userId") `);
        await queryRunner.query(`ALTER TABLE "doctor" ADD CONSTRAINT "FK_doctor_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_b463fce395ead7791607a5c33eb" FOREIGN KEY ("slotId") REFERENCES "doctor_timeslot"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_5ce4c3130796367c93cd817948e" FOREIGN KEY ("patientId") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
