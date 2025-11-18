import type { User, Task, Comment } from './index';

export type Board = {
  id: string;
  name: string;
  clientEmail: string;
  clientId?: string | null;
  managerId?: string | null; 
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;

  manager?: User | null; //  может быть null, если удалён менеджер
  client?: User | null;  // может быть null, если удалён клиент
  tasks?: Task[];
  comments?: Comment[];
};



export type BoardBase = {
  id: string;
  name: string;
  clientEmail: string;
  clientId: string | null;
  managerId: string | null;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateBoardData = {
  name: string;
  clientEmail: string;
  clientId?: string | null;
  managerId?: string | null;
};

export type UpdateBoardData = Partial<{
  name: string;
  clientEmail: string;
  clientId: string | null;
  managerId: string | null;
  isArchived: boolean;
}>;