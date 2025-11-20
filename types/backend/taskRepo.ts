import type {TypeProjectStatus, TaskBase, TaskFilters, PaginationOptions, TaskBaseMinimal } from "../shared";

export type TaskRepository = {
  deleteById(id: string): Promise<TaskBaseMinimal>
  findById(taskId:string):Promise<TaskBase| null>
  createTask(data: CreateTaskData): Promise<TaskBase>;
  updateTask(data: UpdateTaskData): Promise<TaskBase>; 

  getTasksForExecutor(
    userId: string,
    options?: PaginationOptions & TaskFilters // теперь можно передавать status, responsibleId
  ): Promise<TaskBase[]>;

  getTasksByBoard(
    boardId: string,
    options?: PaginationOptions & TaskFilters
  ): Promise<TaskBase[]>;

  getAllTasks(
    options?: PaginationOptions & TaskFilters
  ): Promise<TaskBase[]>;
};



export type CreateTaskData = {
  title: string;
  description?: string | null;
  status?: TypeProjectStatus;
  boardId: string;
  assignedToId?: string | null;
  responsibleId?: string | null;
  order?: number | null;
  deadline?: Date | null;
};


export type UpdateTaskData = {
  id:string
  title?: string;
  description?: string | null;
  status?: TypeProjectStatus;
  assignedToId?: string | null;
  responsibleId?: string | null;
  order?: number | null;
  deadline?: Date | null;
};