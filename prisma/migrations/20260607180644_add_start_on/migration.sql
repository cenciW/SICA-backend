-- AlterTable
ALTER TABLE "user_product" ADD COLUMN     "led_start_on" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pump_start_on" BOOLEAN NOT NULL DEFAULT true;
