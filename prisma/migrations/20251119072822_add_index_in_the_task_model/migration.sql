-- CreateIndex
CREATE INDEX `Task_assignedToId_boardId_idx` ON `Task`(`assignedToId`, `boardId`);
