-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('ETH', 'POL');

-- CreateTable
CREATE TABLE "Prices" (
    "id" SERIAL NOT NULL,
    "chain" "Chain" NOT NULL,
    "token_name" TEXT NOT NULL,
    "token_symbol" TEXT NOT NULL,
    "token_decimals" INTEGER NOT NULL,
    "usd_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerts" (
    "id" SERIAL NOT NULL,
    "chain" "Chain" NOT NULL,
    "dollar" DECIMAL(20,8) NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prices_chain_created_at_idx" ON "Prices"("chain", "created_at");

-- CreateIndex
CREATE INDEX "Alerts_chain_dollar_idx" ON "Alerts"("chain", "dollar");
