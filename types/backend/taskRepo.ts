
import type { TaskBase, TaskFilters, PaginationOptions, TypeProjectStatus } from "../shared";
export type TaskRepository = {
  getTasksForExecutor(
    userId: string,
    options?: PaginationOptions & { status?: TypeProjectStatus }
  ): Promise<TaskBase[]>;

  getTasksByBoard(
    boardId: string,
    filters?: TaskFilters & PaginationOptions
  ): Promise<TaskBase[]>;

  getAllTasks(
    options?: PaginationOptions & { status?: TypeProjectStatus }
  ): Promise<TaskBase[]>;
};