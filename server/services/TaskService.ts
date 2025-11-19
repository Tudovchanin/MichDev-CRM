import type { TaskRepository  } from "~/types/backend/taskRepo";
import BoardService from "./BoardService";
import type { TaskBase, TaskFilters } from "~/types/shared";
import type { UserBase } from "~/types/shared";


class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private boardService?: BoardService
  ) {}

  async getTasksByUser(userId: string): Promise<TaskBase[]> {
    return this.taskRepository.getTasksByUser(userId);
  }


  async getTasksByBoard(
    boardId: string,
    user: UserBase,
    filters?: TaskFilters
  ): Promise<TaskBase[]> {
    if(!this.boardService) {
      throw createError({ statusCode: 500, message: "Ошибка сервера" });
    }

        // Проверяем доступ к доске
    await this.boardService.getBoardByIdForUser(user.id, user.role, boardId);

    // Получаем задачи с фильтрами
    return this.taskRepository.getTasksByBoard(boardId, filters);
  }


  async getAllTasks(): Promise<TaskBase[]> {
    return this.taskRepository.getAllTasks();
  }
}

export default TaskService;
