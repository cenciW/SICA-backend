/*
  Warnings:

  - You are about to drop the column `product_id` on the `alert` table. All the data in the column will be lost.
  - You are about to drop the column `last_reading_at` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `ph_current` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `ph_max` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `ph_min` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `ppm_current` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `ppm_max` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `ppm_min` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `pump_last_action_at` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `pump_state` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `relay_last_action_at` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `relay_state` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `reading` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[client_id]` on the table `user_product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_product_id` to the `alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_product_id` to the `reading` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_id` to the `user_product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "alert" DROP CONSTRAINT "alert_product_id_fkey";

-- DropForeignKey
ALTER TABLE "reading" DROP CONSTRAINT "reading_product_id_fkey";

-- DropIndex
DROP INDEX "alert_product_id_resolved_created_at_idx";

-- DropIndex
DROP INDEX "reading_product_id_sensor_type_recorded_at_idx";

-- DropIndex
DROP INDEX "user_product_product_id_user_id_key";

-- AlterTable
ALTER TABLE "alert" DROP COLUMN "product_id",
ADD COLUMN     "user_product_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "last_reading_at",
DROP COLUMN "ph_current",
DROP COLUMN "ph_max",
DROP COLUMN "ph_min",
DROP COLUMN "ppm_current",
DROP COLUMN "ppm_max",
DROP COLUMN "ppm_min",
DROP COLUMN "pump_last_action_at",
DROP COLUMN "pump_state",
DROP COLUMN "relay_last_action_at",
DROP COLUMN "relay_state";

-- AlterTable
ALTER TABLE "reading" DROP COLUMN "product_id",
ADD COLUMN     "user_product_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "user_product" ADD COLUMN     "client_id" VARCHAR(8) NOT NULL,
ADD COLUMN     "last_reading_at" TIMESTAMP(6),
ADD COLUMN     "name" VARCHAR(100),
ADD COLUMN     "ph_current" DOUBLE PRECISION,
ADD COLUMN     "ph_max" DOUBLE PRECISION,
ADD COLUMN     "ph_min" DOUBLE PRECISION,
ADD COLUMN     "ppm_current" DOUBLE PRECISION,
ADD COLUMN     "ppm_max" DOUBLE PRECISION,
ADD COLUMN     "ppm_min" DOUBLE PRECISION,
ADD COLUMN     "pump_last_action_at" TIMESTAMP(6),
ADD COLUMN     "pump_state" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "relay_last_action_at" TIMESTAMP(6),
ADD COLUMN     "relay_state" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "role" SET DEFAULT 'OWNER';

-- CreateIndex
CREATE INDEX "alert_user_product_id_resolved_created_at_idx" ON "alert"("user_product_id", "resolved", "created_at");

-- CreateIndex
CREATE INDEX "reading_user_product_id_sensor_type_recorded_at_idx" ON "reading"("user_product_id", "sensor_type", "recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_product_client_id_key" ON "user_product"("client_id");

-- AddForeignKey
ALTER TABLE "reading" ADD CONSTRAINT "reading_user_product_id_fkey" FOREIGN KEY ("user_product_id") REFERENCES "user_product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_user_product_id_fkey" FOREIGN KEY ("user_product_id") REFERENCES "user_product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
