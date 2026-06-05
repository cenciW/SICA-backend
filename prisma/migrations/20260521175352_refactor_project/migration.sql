/*
  Warnings:

  - You are about to drop the `atuador` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `estufa` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `estufa_usuario` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `historico_sensor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `modulo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sensor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SensorType" AS ENUM ('PH', 'EC');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('WARNING', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "atuador" DROP CONSTRAINT "atuador_modulo_id_fkey";

-- DropForeignKey
ALTER TABLE "estufa_usuario" DROP CONSTRAINT "estufa_usuario_estufa_id_fkey";

-- DropForeignKey
ALTER TABLE "estufa_usuario" DROP CONSTRAINT "estufa_usuario_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "historico_sensor" DROP CONSTRAINT "historico_sensor_sensor_id_fkey";

-- DropForeignKey
ALTER TABLE "modulo" DROP CONSTRAINT "modulo_estufa_id_fkey";

-- DropForeignKey
ALTER TABLE "sensor" DROP CONSTRAINT "sensor_modulo_id_fkey";

-- DropTable
DROP TABLE "atuador";

-- DropTable
DROP TABLE "estufa";

-- DropTable
DROP TABLE "estufa_usuario";

-- DropTable
DROP TABLE "historico_sensor";

-- DropTable
DROP TABLE "modulo";

-- DropTable
DROP TABLE "sensor";

-- DropTable
DROP TABLE "usuario";

-- DropEnum
DROP TYPE "ModuloTipo";

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" VARCHAR(500),
    "link_code" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "firmware_version" VARCHAR(50),
    "ph_min" DOUBLE PRECISION,
    "ph_max" DOUBLE PRECISION,
    "ec_min" DOUBLE PRECISION,
    "ec_max" DOUBLE PRECISION,
    "ph_current" DOUBLE PRECISION,
    "ec_current" DOUBLE PRECISION,
    "last_reading_at" TIMESTAMP(6),
    "relay_state" BOOLEAN NOT NULL DEFAULT false,
    "relay_last_action_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "sensor_type" "SensorType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "recorded_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "sensor_type" "SensorType" NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(6),

    CONSTRAINT "alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "product_link_code_key" ON "product"("link_code");

-- CreateIndex
CREATE INDEX "reading_product_id_sensor_type_recorded_at_idx" ON "reading"("product_id", "sensor_type", "recorded_at");

-- CreateIndex
CREATE INDEX "alert_product_id_resolved_created_at_idx" ON "alert"("product_id", "resolved", "created_at");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading" ADD CONSTRAINT "reading_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert" ADD CONSTRAINT "alert_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
