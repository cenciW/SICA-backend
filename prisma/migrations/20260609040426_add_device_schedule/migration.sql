-- CreateTable
CREATE TABLE "device_schedule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_product_id" UUID NOT NULL,
    "device" VARCHAR(10) NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "device_schedule_user_product_id_device_idx" ON "device_schedule"("user_product_id", "device");

-- AddForeignKey
ALTER TABLE "device_schedule" ADD CONSTRAINT "device_schedule_user_product_id_fkey" FOREIGN KEY ("user_product_id") REFERENCES "user_product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
