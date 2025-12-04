-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "usuario" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "usuario" VARCHAR(100) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "nome_completo" VARCHAR(255),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estufa_usuario" (
    "id" TEXT NOT NULL,
    "estufa_id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "data_acesso_inicio" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_acesso_fim" TIMESTAMP(6),

    CONSTRAINT "estufa_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estufa" (
    "id" UUID NOT NULL,
    "nome" VARCHAR(200) NOT NULL,
    "localizacao" VARCHAR(500),
    "largura" DOUBLE PRECISION NOT NULL,
    "altura" DOUBLE PRECISION NOT NULL,
    "comprimento" DOUBLE PRECISION NOT NULL,
    "volume_total" DOUBLE PRECISION,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ativa',
    "firmware_versao" VARCHAR(50),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estufa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_usuario_key" ON "usuario"("usuario");

-- AddForeignKey
ALTER TABLE "estufa_usuario" ADD CONSTRAINT "estufa_usuario_estufa_id_fkey" FOREIGN KEY ("estufa_id") REFERENCES "estufa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estufa_usuario" ADD CONSTRAINT "estufa_usuario_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
