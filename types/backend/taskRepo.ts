
import type { TaskBase } from "../shared";


export type TaskRepository = {
  getTasksByUser(userId: string): Promise<TaskBase[]>;
  getTasksByBoard(boardId: string): Promise<TaskBase[]>;
  getAllTasks(): Promise<TaskBase[]>;
}