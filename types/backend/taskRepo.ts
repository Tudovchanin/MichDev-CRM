
import type { TaskBase, TaskFilters } from "../shared";


export type TaskRepository = {
  getTasksByUser(userId: string): Promise<TaskBase[]>;
  getTasksByBoard(boardId: string, filters?: TaskFilters): Promise<TaskBase[]>;
  getAllTasks(): Promise<TaskBase[]>;
}