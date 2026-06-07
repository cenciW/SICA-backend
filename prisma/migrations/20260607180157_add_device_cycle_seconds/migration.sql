-- AlterTable
ALTER TABLE "user_product" ADD COLUMN     "led_off_seconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "led_on_seconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pump_off_seconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pump_on_seconds" INTEGER NOT NULL DEFAULT 0;
