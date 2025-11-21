
import type { CommentRepository, CommentBase } from "~/types/backend/commentRepo";
import type { CreateCommentData, CommentUpdate } from "~/types/shared";

class CommentService {
  constructor(
    private commentRepository: CommentRepository,
  ) { }

  async createComment(data: CreateCommentData): Promise<CommentBase> {
    const comment = await this.commentRepository.create(data);


    return comment;
  }

  async updateComment(id: string, data: CommentUpdate, userId: string): Promise<CommentBase> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw createError({ statusCode: 404, message: "Коммент не найден" });
    if (comment.authorId !== userId) throw createError({ statusCode: 403, message: "Ошибка доступа" });

    return this.commentRepository.update(id, data);
  }

  async deleteComment(id: string, userId: string): Promise<CommentBase> {
    const comment = await this.commentRepository.findById(id);
    if (!comment) throw createError({ statusCode: 404, message: "Коммент не найден" });
    if (comment.authorId !== userId) throw createError({ statusCode: 403, message: "Ошибка доступа" });

    return this.commentRepository.deleteById(id);
  }

  async getCommentsByTask(taskId: string, skip?: number, take?: number): Promise<CommentBase[]> {
    return this.commentRepository.findByTaskId(taskId, skip = 0, take = 20);
  }

}


export default CommentService;