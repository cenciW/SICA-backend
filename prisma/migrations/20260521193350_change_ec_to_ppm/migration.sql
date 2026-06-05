/*
  Warnings:

  - The values [EC] on the enum `SensorType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ec_current` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `ec_max` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `ec_min` on the `product` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SensorType_new" AS ENUM ('PH', 'PPM');
ALTER TABLE "reading" ALTER COLUMN "sensor_type" TYPE "SensorType_new" USING ("sensor_type"::text::"SensorType_new");
ALTER TABLE "alert" ALTER COLUMN "sensor_type" TYPE "SensorType_new" USING ("sensor_type"::text::"SensorType_new");
ALTER TYPE "SensorType" RENAME TO "SensorType_old";
ALTER TYPE "SensorType_new" RENAME TO "SensorType";
DROP TYPE "SensorType_old";
COMMIT;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "ec_current",
DROP COLUMN "ec_max",
DROP COLUMN "ec_min",
ADD COLUMN     "ppm_current" DOUBLE PRECISION,
ADD COLUMN     "ppm_max" DOUBLE PRECISION,
ADD COLUMN     "ppm_min" DOUBLE PRECISION;
