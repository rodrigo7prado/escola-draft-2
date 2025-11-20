/*
  Warnings:

  - You are about to drop the column `dataInclusaoAluno` on the `series_cursadas` table. All the data in the column will be lost.
  - You are about to drop the column `matrizCurricular` on the `series_cursadas` table. All the data in the column will be lost.
  - You are about to drop the column `redeEnsinoOrigem` on the `series_cursadas` table. All the data in the column will be lost.
  - You are about to drop the column `tipoIngresso` on the `series_cursadas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "series_cursadas" DROP COLUMN "dataInclusaoAluno",
DROP COLUMN "matrizCurricular",
DROP COLUMN "redeEnsinoOrigem",
DROP COLUMN "tipoIngresso";
