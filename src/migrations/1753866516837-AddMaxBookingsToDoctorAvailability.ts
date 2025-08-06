import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMaxBookingsToDoctorAvailability1753866516837 implements MigrationInterface {
    name = 'AddMaxBookingsToDoctorAvailability1753866516837'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_availability" ADD "maxBookings" integer`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ADD "availabilityId" integer`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" ADD CONSTRAINT "FK_fb958d0f9fd74ee51abf4ff1a5e" FOREIGN KEY ("availabilityId") REFERENCES "doctor_availability"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" DROP CONSTRAINT "FK_fb958d0f9fd74ee51abf4ff1a5e"`);
        await queryRunner.query(`ALTER TABLE "doctor_timeslot" DROP COLUMN "availabilityId"`);
        await queryRunner.query(`ALTER TABLE "doctor_availability" DROP COLUMN "maxBookings"`);
    }

}
