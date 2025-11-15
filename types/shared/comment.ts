import type { User, Board, Task } from './index';

export type Comment = {
  id: string;
  text: string;
  authorId: string;
  boardId: string;
  taskId?: string | null;
  createdAt: Date;
  updatedAt: Date;

  author?: User;
  board?: Board;
  task?: Task | null;
};
