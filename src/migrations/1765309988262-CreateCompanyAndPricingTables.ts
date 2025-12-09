import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanyAndPricingTables1765309988262 implements MigrationInterface {
  name = 'CreateCompanyAndPricingTables1765309988262';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "country" character varying NOT NULL, "description" character varying, "address" character varying, "phone" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."pricings_costtype_enum" AS ENUM('absolute', 'relative')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pricings" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" character varying, "cost" numeric(10,2) NOT NULL, "costType" "public"."pricings_costtype_enum" NOT NULL DEFAULT 'absolute', "isBasePlan" boolean NOT NULL DEFAULT false, "companyId" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_30c670ed2cd925e024eb3a2a1c8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "pricings" ADD CONSTRAINT "FK_41b6c1cc1b739c6dc6902055f6d" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pricings" DROP CONSTRAINT "FK_41b6c1cc1b739c6dc6902055f6d"`,
    );
    await queryRunner.query(`DROP TABLE "pricings"`);
    await queryRunner.query(`DROP TYPE "public"."pricings_costtype_enum"`);
    await queryRunner.query(`DROP TABLE "companies"`);
  }
}
