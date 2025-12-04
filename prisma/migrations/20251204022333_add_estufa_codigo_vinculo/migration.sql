/*
  Warnings:

  - A unique constraint covering the columns `[codigo_vinculo]` on the table `estufa` will be added. If there are existing duplicate values, this will fail.
  - The required column `codigo_vinculo` was added to the `estufa` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "estufa" ADD COLUMN     "codigo_vinculo" VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "estufa_codigo_vinculo_key" ON "estufa"("codigo_vinculo");
