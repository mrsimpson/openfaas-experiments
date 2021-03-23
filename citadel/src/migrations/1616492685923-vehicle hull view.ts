import {MigrationInterface, QueryRunner} from "typeorm";

export class vehicleHullView1616492685923 implements MigrationInterface {
    name = 'vehicleHullView1616492685923'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "vehicle"."geo" IS NULL`);
        await queryRunner.query(`ALTER TABLE "vehicle" ALTER COLUMN "geo" TYPE geometry(Point)`);
        await queryRunner.query(`CREATE VIEW "vehicle_hull" AS 
                SELECT
                  ST_ConcaveHull(ST_Collect(geo), 0.99) as "border"
                  FROM "vehicle"
                `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("type", "schema", "name", "value") VALUES ($1, $2, $3, $4)`, ["VIEW","public","vehicle_hull","SELECT\n                  ST_ConcaveHull(ST_Collect(geo), 0.99) as \"border\"\n                  FROM \"vehicle\""]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = 'VIEW' AND "schema" = $1 AND "name" = $2`, ["public","vehicle_hull"]);
        await queryRunner.query(`DROP VIEW "vehicle_hull"`);
        await queryRunner.query(`ALTER TABLE "vehicle" ALTER COLUMN "geo" TYPE geometry(POINT,0)`);
        await queryRunner.query(`COMMENT ON COLUMN "vehicle"."geo" IS NULL`);
    }

}
