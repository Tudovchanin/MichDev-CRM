import type { TaskRepository } from "~/types/backend/taskRepo";
import BoardService from "./BoardService";
import type { PaginationOptions, TaskBase, TaskFilters } from "~/types/shared";
import type { UserBase, TaskBaseMinimal } from "~/types/shared";
import type { CreateTaskBodyServer, UpdateTaskBodyServer } from "../validations/task";
import type { CreateTaskData, UpdateTaskData } from "~/types/backend/taskRepo";

class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private boardService?: BoardService
  ) { }

  async getTaskById(taskId:string):Promise<TaskBase>{

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw createError({ statusCode: 404, message: 'Задача не найдена' });
    }
    return task;
  
  }

  //  только админ и менеджер
  async createTask(body: CreateTaskBodyServer, user: UserBase): Promise<TaskBase> {
    const data: CreateTaskData = {
      title: body.title,
      description: body.description ?? null,
      status: body.status ?? "NEW",
      boardId: body.boardId,
      assignedToId: body.assignedToId ?? null,
      // админ может выбирать из менеджеров на задачу(responsibleId), а менеджер назначается автоматом
      responsibleId: user.role === 'ADMIN' ? body.responsibleId ?? user.id : user.id,
      order: body.order ?? null,
      deadline: body.deadline ?? null,
    };


    return this.taskRepository.createTask(data);
  }

  async updateTask(
    body: UpdateTaskBodyServer,
    user: UserBase,
    taskId: string
  ): Promise<TaskBase> {


    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw createError({ statusCode: 404, message: "Задача не найдена" });
    }
  
    let data: UpdateTaskData;
  
    switch (user.role) {
      case "ADMIN":
        // Админ может менять все поля без ограничений
        data = {
          id: taskId,
          title: body.title,
          description: body.description,
          status: body.status,
          assignedToId: body.assignedToId,
          responsibleId: body.responsibleId,
          order: body.order,
          deadline: body.deadline,
        };
        break;
  
      case "MANAGER":
        // Менеджер может менять все задачи на своих досках
        const board = await this.boardService?.getBoardByIdForUser(user.id, user.role, task.boardId);
        if (!board) {
          throw createError({ statusCode: 403, message: "Нет доступа к этой доске" });
        }
        data = {
          id: taskId,
          title: body.title,
          description: body.description,
          status: body.status,
          assignedToId: body.assignedToId,
          responsibleId: body.responsibleId,
          order: body.order,
          deadline: body.deadline,
        };
        break;
  
      case "EXECUTOR":
        // Исполнитель может менять только свои задачи
        if (task.assignedToId !== user.id) {
          throw createError({ statusCode: 403, message: "Нет прав изменять эту задачу" });
        }
        // Можно менять только status и order
        data = {
          id: taskId,
          status: body.status,
          order: body.order,
        };
        break;
  
      default:
        throw createError({ statusCode: 403, message: "Нет прав изменять эту задачу" });
    }
  
    return this.taskRepository.updateTask(data);
  }
  
  // все задачи исполнителя
  async getTasksForExecutor(
    userId: string,
    { skip = 0, take = 20, status, responsibleId, boardId }: PaginationOptions & TaskFilters = {}
  ): Promise<TaskBase[]> {

    const safeResponsibleId = responsibleId === 'null' ? null : responsibleId;

    return this.taskRepository.getTasksForExecutor(userId, { skip, take, status, responsibleId: safeResponsibleId, boardId });
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

    // Проверяем, что пользователь имеет доступ к доске
    await this.boardService.getBoardByIdForUser(user.id, user.role, boardId);

    // Создаём "безопасную" копию фильтров, чтобы не мутировать исходный объект
    const safeFilters: TaskFilters = { ...filters };

    // Если пришло 'null' как строка из query — превращаем в actual null
    if (safeFilters.responsibleId === 'null') safeFilters.responsibleId = null;
    if (safeFilters.assignedToId === 'null') safeFilters.assignedToId = null;


    switch (user.role) {
      case "ADMIN":
        // Админ видит все задачи, фильтры применяем как есть
        break;

      case "MANAGER":
        // Менеджер видит все задачи на своей доске
        // Не ограничиваем по responsibleId, даже если она указана — доска один менеджер
        break;

      case "CLIENT":
        // Клиент видит только задачи своей доски
        // все фильтры в пределах своей доски
        break;

      case "EXECUTOR":
        // Исполнитель видит только свои задачи
        safeFilters.assignedToId = user.id;
        break;

      default:
        // Если роль неизвестна, не отдаём задачи
        console.warn(`Unknown role: ${user.role} tried to access board tasks`);
        return [];
    }

    // Получаем задачи из репозитория
    return this.taskRepository.getTasksByBoard(boardId, safeFilters);
  }

  // Получить все задачи
  async getAllTasks({ skip = 0, take = 20, status, assignedToId, responsibleId, boardId }: PaginationOptions & TaskFilters = {}): Promise<TaskBase[]> {

    if (responsibleId === 'null') responsibleId = null;
    if (assignedToId === 'null') assignedToId = null;

    return this.taskRepository.getAllTasks({ skip, take, status, assignedToId, responsibleId, boardId });
  }

  async getTasksForUser(
    user: UserBase,
    {
      skip = 0,
      take = 20,
      status,
      assignedToId,
      responsibleId,
      boardId
    }: PaginationOptions & TaskFilters = {}
  ): Promise<TaskBase[]> {

    const safeAssignedToId = assignedToId === 'null' ? null : assignedToId;
    const safeResponsibleId = responsibleId === 'null' ? null : responsibleId;


    switch (user.role) {
      case "ADMIN":
        // Админ видит все задачи
        if (boardId) {
          return this.getTasksByBoard(boardId, user, { status, assignedToId: safeAssignedToId, responsibleId });
        }
        return this.getAllTasks({ skip, take, status, assignedToId, responsibleId: safeResponsibleId, boardId });

      case "MANAGER":
        // Менеджер видит задачи, где он ответственный
        return this.getAllTasks({
          skip,
          take,
          status,
          assignedToId: safeAssignedToId,
          responsibleId: user.id,
          boardId
        });

      case "EXECUTOR":
        // Исполнитель видит только свои задачи, может фильтровать по responsibleId
        return this.getTasksForExecutor(user.id, { skip, take, status, responsibleId: safeResponsibleId });

      case "CLIENT":
        // Клиент видит задачи только на своей доске
        if (!boardId) {
          console.warn(`Client ${user.id} tried to access tasks without boardId`);
          return [];
        }
        return this.getTasksByBoard(boardId, user, { status, assignedToId: safeAssignedToId, responsibleId: safeResponsibleId });

      default:
        console.warn(`Unknown role: ${user.role} tried to access tasks`);
        return [];
    }
  }

  async getTaskByIdForUser(taskId: string, user: UserBase): Promise<TaskBase> {

    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw createError({ statusCode: 404, message: "Задача не найдена" });
    }
  
    switch (user.role) {
      case 'ADMIN':
        // Админ видит всё
        return task;
  
      case 'EXECUTOR':
        // Исполнитель может видеть только свои задачи
        if (task.assignedToId !== user.id) {
          throw createError({ statusCode: 403, message: "Нет доступа к этой задаче" });
        }
        return task;
  
      case 'MANAGER':
      case 'CLIENT':
        // Проверяем доступ к доске
        if (!this.boardService) {
          throw createError({ statusCode: 500, message: "Ошибка сервиса досок" });
        }
        await this.boardService.getBoardByIdForUser(user.id, user.role, task.boardId);
        // Если getBoardByIdForUser не выбросил ошибку — доступ есть
        return task;
  
      default:
        throw createError({ statusCode: 403, message: "Нет доступа к этой задаче" });
    }
  }
  
  async deleteTask(taskId:string):Promise<TaskBaseMinimal> {
    return this.taskRepository.deleteById(taskId);
  }
  

}

export default TaskService;
