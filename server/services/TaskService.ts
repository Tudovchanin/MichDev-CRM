


import type { TaskRepository } from "~/types/backend/taskRepo";

import type { TaskBase } from "~/types/shared";


 class TaskService {
  constructor(private repository: TaskRepository) {}

  getTasksByUser(userId: string): Promise<TaskBase[]> {
    return this.repository.getTasksByUser(userId);
  }

  getTasksByBoard(boardId: string): Promise<TaskBase[]> {
    return this.repository.getTasksByBoard(boardId);
  }

  getAllTasks(): Promise<TaskBase[]> {
    return this.repository.getAllTasks();
  }
}


export default TaskService