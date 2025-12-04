/*
  Warnings:

  - You are about to alter the column `codigo_vinculo` on the `estufa` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "estufa" ALTER COLUMN "codigo_vinculo" SET DATA TYPE VARCHAR(100);
