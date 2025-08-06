import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingTables1752674577369 implements MigrationInterface {
    name = 'AddMissingTables1752674577369'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "doctor_availability" ("id" SERIAL NOT NULL, "dayOfWeek" character varying NOT NULL, "timeSlots" jsonb NOT NULL, "doctorId" integer NOT NULL, CONSTRAINT "PK_3d2b4ffe9085f8c7f9f269aed89" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_timeslot" ("id" SERIAL NOT NULL, "date" character varying NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "doctorId" integer NOT NULL, CONSTRAINT "PK_6f0d88979b19e55b3a6e6c7c37a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "appointment" ("id" SERIAL NOT NULL, "date" character varying NOT NULL, "time" character varying NOT NULL, "token" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, "doctorId" integer, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "year_experience"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" ADD "phoneNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "patient" ADD "age" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient" ADD "sex" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient" ADD "weight" double precision NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient" ADD "complaint" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "experienceYears" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "qualifications" character varying`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "availability" jsonb`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "oneTimeSlots" jsonb`);
        await queryRunner.query(`CREATE TYPE "public"."doctor_scheduletype_enum" AS ENUM('REGULAR', 'ONLINE', 'RSVP')`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "scheduleType" "public"."doctor_scheduletype_enum" NOT NULL DEFAULT 'REGULAR'`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('doctor', 'patient')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP CONSTRAINT "FK_e573a17ab8b6eea2b7fe9905fa8"`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD CONSTRAINT "FK_e573a17ab8b6eea2b7fe9905fa8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_7ebf8396e8918307342d6bcf82b" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ADD CONSTRAINT "FK_d3f09db2c905eeecc91c6ccae0a" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_2a990a304a43ccc7415bf7e3a99" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointment" ADD CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_514bcc3fb1b8140f85bf1cde6e2"`);
        await queryRunner.query(`ALTER TABLE "appointment" DROP CONSTRAINT "FK_2a990a304a43ccc7415bf7e3a99"`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" DROP CONSTRAINT "FK_d3f09db2c905eeecc91c6ccae0a"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_7ebf8396e8918307342d6bcf82b"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP CONSTRAINT "FK_e573a17ab8b6eea2b7fe9905fa8"`);
        await queryRunner.query(`ALTER TABLE "doctor" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD CONSTRAINT "FK_e573a17ab8b6eea2b7fe9905fa8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "scheduleType"`);
        await queryRunner.query(`DROP TYPE "public"."doctor_scheduletype_enum"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "oneTimeSlots"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "availability"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "qualifications"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "experienceYears"`);
        await queryRunner.query(`ALTER TABLE "doctor" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "complaint"`);
        await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "sex"`);
        await queryRunner.query(`ALTER TABLE "patient" DROP COLUMN "age"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "phoneNumber"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "year_experience" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "doctor" ADD "title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "patient" ADD "dateOfBirth" TIMESTAMP NOT NULL`);
        await queryRunner.query(`DROP TABLE "appointment"`);
        await queryRunner.query(`DROP TABLE "doctor_timeslot"`);
        await queryRunner.query(`DROP TABLE "doctor_availability"`);
    }

}
