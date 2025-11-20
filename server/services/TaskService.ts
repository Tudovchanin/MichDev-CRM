import type { TaskRepository } from "~/types/backend/taskRepo";
import BoardService from "./BoardService";
import type { TaskBase, TaskFilters, TypeProjectStatus } from "~/types/shared";
import type { UserBase } from "~/types/shared";


class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private boardService?: BoardService
  ) { }


  // все задачи исполнителя
  async getTasksForExecutor(
    userId: string,
    { skip = 0, take = 20, status }: { skip?: number; take?: number; status?: TypeProjectStatus } = {}
  ): Promise<TaskBase[]> {
    return this.taskRepository.getTasksForExecutor(userId, { skip, take, status });
  }


  // получить задачи с помощью доски
  async getTasksByBoard(
    boardId: string,
    user: UserBase,
    filters?: TaskFilters
  ): Promise<TaskBase[]> {
    if (!this.boardService) {
      throw createError({ statusCode: 500, message: "Ошибка сервера" });
    }

    // Проверяем доступ к доске пользователя из которой берем задачи
    await this.boardService.getBoardByIdForUser(user.id, user.role, boardId);

    // Получаем задачи с фильтрами
    return this.taskRepository.getTasksByBoard(boardId, filters);
  }

  async getAllTasks({ skip = 0, take = 20, status }: {
    skip?: number;
    take?: number;
    status?: TypeProjectStatus;
  } = {}): Promise<TaskBase[]> {
    return this.taskRepository.getAllTasks({ skip, take, status });
  }

  async getTasksForUser(user: UserBase, filters?: TaskFilters): Promise<TaskBase[]> {
    switch (user.role) {
      case "ADMIN":
        if (filters?.boardId) {
          return this.getTasksByBoard(filters.boardId, user, filters);
        }
  
        if (filters?.assignedToId) {
          return this.getTasksForExecutor(filters.assignedToId, {
            status: filters.status
          });
        }
  
        return this.getAllTasks({
          status: filters?.status
        });
  
  
      case "EXECUTOR":
        return this.getTasksForExecutor(user.id, {
          status: filters?.status
        });
  
  
      default:
        return [];
    }
  }
  
}

export default TaskService;
