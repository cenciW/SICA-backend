-- AlterTable
ALTER TABLE "estufa" ADD COLUMN     "exaustor_ligado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "led_ligado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "temperatura" DOUBLE PRECISION DEFAULT 25.0,
ADD COLUMN     "umidade" DOUBLE PRECISION DEFAULT 60.0,
ADD COLUMN     "ventilador_ligado" BOOLEAN NOT NULL DEFAULT false;
