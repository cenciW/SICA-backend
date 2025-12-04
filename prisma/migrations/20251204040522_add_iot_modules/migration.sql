-- CreateEnum
CREATE TYPE "ModuloTipo" AS ENUM ('CO2', 'IRRIGACAO', 'ILUMINACAO', 'CLIMA', 'NUTRICAO');

-- CreateTable
CREATE TABLE "modulo" (
    "id" TEXT NOT NULL,
    "estufa_id" TEXT NOT NULL,
    "tipo" "ModuloTipo" NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "configuracao" JSONB,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensor" (
    "id" TEXT NOT NULL,
    "modulo_id" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "unidade" VARCHAR(20) NOT NULL,
    "valor_atual" DOUBLE PRECISION,
    "valor_min" DOUBLE PRECISION,
    "valor_max" DOUBLE PRECISION,
    "ultima_leitura" TIMESTAMP(6),

    CONSTRAINT "sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico_sensor" (
    "id" TEXT NOT NULL,
    "sensor_id" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atuador" (
    "id" TEXT NOT NULL,
    "modulo_id" TEXT NOT NULL,
    "tipo" VARCHAR(50) NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "estado" BOOLEAN NOT NULL DEFAULT false,
    "modo" VARCHAR(20) NOT NULL DEFAULT 'manual',
    "ultima_acao" TIMESTAMP(6),

    CONSTRAINT "atuador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historico_sensor_sensor_id_timestamp_idx" ON "historico_sensor"("sensor_id", "timestamp");

-- AddForeignKey
ALTER TABLE "modulo" ADD CONSTRAINT "modulo_estufa_id_fkey" FOREIGN KEY ("estufa_id") REFERENCES "estufa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor" ADD CONSTRAINT "sensor_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico_sensor" ADD CONSTRAINT "historico_sensor_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "sensor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atuador" ADD CONSTRAINT "atuador_modulo_id_fkey" FOREIGN KEY ("modulo_id") REFERENCES "modulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
