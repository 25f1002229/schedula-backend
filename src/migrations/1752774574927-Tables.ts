import { MigrationInterface, QueryRunner } from "typeorm";

export class Tables1752774574927 implements MigrationInterface {
    name = 'Tables1752774574927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor" DROP CONSTRAINT "FK_e573a17ab8b6eea2b7fe9905fa8"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_2a990a304a43ccc7415bf7e3a99"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2"`);
        await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT "FK_6636aefca0bdad8933c7cc3e394"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP CONSTRAINT "REL_e573a17ab8b6eea2b7fe9905fa"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "availability"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "oneTimeSlots"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "scheduleType"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_scheduletype_enum"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "time"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "token"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "userId"`);
        await queryRunner.query(`CREATE TYPE "public"."doctor_timeslot_mode_enum" AS ENUM('stream', 'wave')`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ADD "mode" "public"."doctor_timeslot_mode_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ADD "maxBookings" integer`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "reason" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "patientId" integer`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "slotId" integer`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" DROP CONSTRAINT "FK_d3f09db2c905eeecc91c6ccae0a"`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ALTER COLUMN "doctorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "patient" ADD "weight" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_7ebf8396e8918307342d6bcf82b"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ALTER COLUMN "doctorId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ADD CONSTRAINT "FK_d3f09db2c905eeecc91c6ccae0a" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_5ce4c3130796367c93cd817948e" FOREIGN KEY ("patientId") REFERENCES "patient"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_b463fce395ead7791607a5c33eb" FOREIGN KEY ("slotId") REFERENCES "doctor_timeslot"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient" ADD CONSTRAINT "FK_6636aefca0bdad8933c7cc3e394" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_7ebf8396e8918307342d6bcf82b" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_7ebf8396e8918307342d6bcf82b"`);
        await queryRunner.query(`ALTER TABLE "patient" DROP CONSTRAINT "FK_6636aefca0bdad8933c7cc3e394"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_b463fce395ead7791607a5c33eb"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_5ce4c3130796367c93cd817948e"`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" DROP CONSTRAINT "FK_d3f09db2c905eeecc91c6ccae0a"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ALTER COLUMN "doctorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_7ebf8396e8918307342d6bcf82b" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "patient" ADD "weight" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ALTER COLUMN "doctorId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ADD CONSTRAINT "FK_d3f09db2c905eeecc91c6ccae0a" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "slotId"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "patientId"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "reason"`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" DROP COLUMN "maxBookings"`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" DROP COLUMN "mode"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_timeslot_mode_enum"`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "token" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "time" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD "date" character varying NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."doctor_scheduletype_enum" AS ENUM('REGULAR', 'ONLINE', 'RSVP')`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "scheduleType" "public"."doctor_scheduletype_enum" NOT NULL DEFAULT 'REGULAR'`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "oneTimeSlots" jsonb`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "availability" jsonb`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "userId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD CONSTRAINT "REL_e573a17ab8b6eea2b7fe9905fa" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "patient" ADD CONSTRAINT "FK_6636aefca0bdad8933c7cc3e394" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_2a990a304a43ccc7415bf7e3a99" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD CONSTRAINT "FK_e573a17ab8b6eea2b7fe9905fa8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
