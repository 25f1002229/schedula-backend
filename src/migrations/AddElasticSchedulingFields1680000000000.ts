import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddElasticSchedulingFields1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn("doctor_availability", new TableColumn({
      name: "defaultSlotDuration",
      type: "int",
      default: 15,
    }));

    await queryRunner.addColumn("doctor_availability", new TableColumn({
      name: "bufferAfterMinutes",
      type: "int",
      default: 5,
    }));

    await queryRunner.addColumn("doctor_timeslot", new TableColumn({
      name: "slotDuration",
      type: "int",
      default: 15,
    }));

    await queryRunner.addColumn("doctor_timeslot", new TableColumn({
      name: "bufferAfter",
      type: "int",
      default: 0,
    }));

    await queryRunner.addColumn("doctor_timeslot", new TableColumn({
      name: "status",
      type: "varchar",
      default: "'available'",
    }));

    await queryRunner.addColumn("appointment", new TableColumn({
      name: "confirmLater",
      type: "boolean",
      default: false,
    }));

    await queryRunner.addColumn("appointment", new TableColumn({
      name: "requestedWindow",
      type: "json",
      isNullable: true,
    }));

    await queryRunner.addColumn("appointment", new TableColumn({
      name: "status",
      type: "varchar",
      default: "'confirmed'",
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("doctor_availability", "defaultSlotDuration");
    await queryRunner.dropColumn("doctor_availability", "bufferAfterMinutes");
    await queryRunner.dropColumn("doctor_timeslot", "slotDuration");
    await queryRunner.dropColumn("doctor_timeslot", "bufferAfter");
    await queryRunner.dropColumn("doctor_timeslot", "status");
    await queryRunner.dropColumn("appointment", "confirmLater");
    await queryRunner.dropColumn("appointment", "requestedWindow");
    await queryRunner.dropColumn("appointment", "status");
  }
}
