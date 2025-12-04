/*
  Warnings:

  - A unique constraint covering the columns `[codigo_vinculo]` on the table `estufa` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "estufa_codigo_vinculo_key" ON "estufa"("codigo_vinculo");
