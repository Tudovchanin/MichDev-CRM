

import type { CreateCommentData, CommentUpdate } from "../shared";


export type CommentRepository = {
  findById(id: string): Promise<CommentBase | null>;
  findByTaskId(taskId: string, skip:number, take:number): Promise<CommentBase[]>
  create(data: CreateCommentData): Promise<CommentBase>;
  update(id: string, data: CommentUpdate): Promise<CommentBase>
  deleteById(id: string): Promise<CommentBase>
};




export type CommentBase = {
  id: string;
  text: string;
  authorId: string;
  boardId: string;
  taskId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
