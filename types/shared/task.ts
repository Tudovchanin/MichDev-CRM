
import type { Board, User, Comment, Notification } from './index';
import type { TypeProjectStatus } from './enums';

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TypeProjectStatus;
  order?: number | null;
  boardId: string;
  assignedToId?: string | null;
  responsibleId?: string | null,
  deadline?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  board?: Board;
  assignedTo?: User | null;
  responsible?: User | null
  comments?: Comment[];
  notifications?: Notification[];
};


export type TaskBase = {
  id: string;
  title: string;
  description: string | null;
  status: TypeProjectStatus;
  order: number | null;
  boardId: string;
  assignedToId: string | null;
  responsibleId: string | null,
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
};


export type TaskFilters = {
  status?: TypeProjectStatus;      // например 'TODO', 'IN_PROGRESS', 'DONE'
  assignedToId?: string | null;   // фильтр по исполнителю
  responsibleId?: string | null;  // кто создал задачу, ответственный.Может быть null так как менеджера(создателя задачи) могут удалить 
  boardId?: string;
};



export type TaskBaseMinimal = {
  id: string;
  title: string;
  boardId: string;
};