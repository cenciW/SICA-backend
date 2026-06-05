-- CreateTable
CREATE TABLE "user_product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'VIEWER',
    "access_start" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "access_end" TIMESTAMP(6),

    CONSTRAINT "user_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_product_product_id_user_id_key" ON "user_product"("product_id", "user_id");

-- AddForeignKey
ALTER TABLE "user_product" ADD CONSTRAINT "user_product_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_product" ADD CONSTRAINT "user_product_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
