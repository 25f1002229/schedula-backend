import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddDoctorIdToDoctorTimeslot1754061175232 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add the doctorId column
        await queryRunner.addColumn("doctor_timeslot", new TableColumn({
            name: "doctorId",
            type: "int",
            isNullable: false,
        }));

        // Add foreign key constraint for doctorId referencing doctor table
        await queryRunner.createForeignKey("doctor_timeslot", new TableForeignKey({
            columnNames: ["doctorId"],
            referencedColumnNames: ["id"],
            referencedTableName: "doctor",
            onDelete: "CASCADE",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Get the table details
        const table = await queryRunner.getTable("doctor_timeslot");
        if (table) {
            // Find the foreign key on doctorId
            const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("doctorId") !== -1);
            if (foreignKey) {
                // Drop the foreign key first
                await queryRunner.dropForeignKey("doctor_timeslot", foreignKey);
            }
        }
        // Drop the doctorId column
        await queryRunner.dropColumn("doctor_timeslot", "doctorId");
    }
}
