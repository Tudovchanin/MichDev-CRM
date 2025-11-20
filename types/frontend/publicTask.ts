

import type { TypeProjectStatus } from "../shared";

export type CreateTaskBodyClient = {
  title: string;
  description?: string | null;
  status?: TypeProjectStatus;
  boardId: string;
  assignedToId?: string | null;
  responsibleId?: string | null;
  order?: number;
  deadline?: string | null; // на фронте Date чаще передаем как ISO string
};

export type UpdateTaskBodyClient = {
  title?: string;
  description?: string | null;
  status?: TypeProjectStatus;
  assignedToId?: string | null;
  responsibleId?: string | null;
  order?: number | null;
  deadline?: string | null; // ISO string или null
};