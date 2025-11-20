-- AlterTable
ALTER TABLE `Task` ADD COLUMN `responsibleId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Task` ADD CONSTRAINT `Task_responsibleId_fkey` FOREIGN KEY (`responsibleId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
