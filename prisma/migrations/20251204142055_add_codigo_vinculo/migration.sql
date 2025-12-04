/*
  Warnings:

  - You are about to drop the column `exaustor_ligado` on the `estufa` table. All the data in the column will be lost.
  - You are about to drop the column `led_ligado` on the `estufa` table. All the data in the column will be lost.
  - You are about to drop the column `temperatura` on the `estufa` table. All the data in the column will be lost.
  - You are about to drop the column `umidade` on the `estufa` table. All the data in the column will be lost.
  - You are about to drop the column `ventilador_ligado` on the `estufa` table. All the data in the column will be lost.
  - The primary key for the `estufa_usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `estufa_usuario` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `role` on the `usuario` table. All the data in the column will be lost.
  - Changed the type of `role` on the `estufa_usuario` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "estufa_codigo_vinculo_key";

-- AlterTable
ALTER TABLE "estufa" DROP COLUMN "exaustor_ligado",
DROP COLUMN "led_ligado",
DROP COLUMN "temperatura",
DROP COLUMN "umidade",
DROP COLUMN "ventilador_ligado",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid(),
ALTER COLUMN "codigo_vinculo" DROP NOT NULL,
ALTER COLUMN "codigo_vinculo" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "estufa_usuario" DROP CONSTRAINT "estufa_usuario_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "role",
ADD COLUMN     "role" VARCHAR(50) NOT NULL,
ADD CONSTRAINT "estufa_usuario_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "usuario" DROP COLUMN "role",
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
