/*
  Warnings:

  - You are about to drop the column `exceriseId` on the `goal` table. All the data in the column will be lost.
  - Added the required column `exerciseId` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `goal` DROP COLUMN `exceriseId`,
    ADD COLUMN `exerciseId` INTEGER NOT NULL;
