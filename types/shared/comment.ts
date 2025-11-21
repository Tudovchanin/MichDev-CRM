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

export type CreateCommentData = {
  text: string;
  authorId: string;
  boardId: string;
  taskId?: string | null;
}

export type CommentUpdate  = {
  text: string;
}
