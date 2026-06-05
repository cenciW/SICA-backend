-- AlterTable
ALTER TABLE "product" ADD COLUMN     "pump_last_action_at" TIMESTAMP(6),
ADD COLUMN     "pump_state" BOOLEAN NOT NULL DEFAULT false;
