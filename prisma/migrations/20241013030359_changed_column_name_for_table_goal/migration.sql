/*
  Warnings:

  - You are about to drop the column `exceriseId` on the `goal` table. All the data in the column will be lost.
  - Added the required column `exerciseId` to the `Goal` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Goal_userId_fkey` ON `goal`;

-- DropIndex
DROP INDEX `History_exerciseId_fkey` ON `history`;

-- DropIndex
DROP INDEX `History_userId_fkey` ON `history`;

-- DropIndex
DROP INDEX `Settings_userId_fkey` ON `settings`;

-- AlterTable
ALTER TABLE `goal` DROP COLUMN `exceriseId`,
    ADD COLUMN `exerciseId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `History` ADD CONSTRAINT `History_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `History` ADD CONSTRAINT `History_exerciseId_fkey` FOREIGN KEY (`exerciseId`) REFERENCES `Exercise`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Goal` ADD CONSTRAINT `Goal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Settings` ADD CONSTRAINT `Settings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
