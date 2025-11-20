
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
  deadline?: Date | null;
  createdAt: Date;
  updatedAt: Date;

  board?: Board;
  assignedTo?: User | null;
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
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
};


export type TaskFilters = {
  status?: TypeProjectStatus;      // например 'TODO', 'IN_PROGRESS', 'DONE'
  assignedToId?: string;    // фильтр по исполнителю
  boardId?: string;
};