
import type { NotificationRepository } from '~/types/backend/notificationRepo';
import type { CreateNotification, NotificationBase, TaskBase, UserBase } from '~/types/shared';
import type { CommentBase } from '~/types/backend/commentRepo';

export default class NotificationService {
  constructor(private notificationRepository: NotificationRepository) {}


  private async createNotification(params:CreateNotification):Promise<NotificationBase> {
    return this.notificationRepository.create({
      userId: params.userId,
      type: params.type,
      message: params.message,
      meta: params.meta ?? null,
      boardId: params.boardId ?? null,
      taskId: params.taskId ?? null,
    });
  }

  async getUserNotifications(userId: string, skip = 0, take = 50) {
    return this.notificationRepository.findByUserId(userId, skip, take);
  }

  async markAllAsRead(userId: string) {
    return this.notificationRepository.markAllAsRead(userId);
  }

 
  // Уведомление о новом комментарии 

  async notifyNewComment(task: TaskBase, comment: CommentBase, author: UserBase) {
    if (!task.assignedToId) return; // нет исполнителя
    if (task.assignedToId === author.id) return; // автор == исполнитель

    return this.createNotification({
      userId: task.assignedToId,
      type: "NEW_COMMENT",
      message: `Новый комментарий в задаче "${task.title}"`,
      taskId: task.id,
      boardId: task.boardId,
      meta: {
        commentId: comment.id,
      },
    });
  }

  async notifyAddedToTheTask(task: TaskBase, creatorRole: 'ADMIN' | 'MANAGER', creatorId: string) {
    const notifications: Promise<NotificationBase>[] = [];
  
    // Если есть исполнитель и он не создатель — уведомляем его
    if (task.assignedToId && task.assignedToId !== creatorId) {
      notifications.push(
        this.createNotification({
          userId: task.assignedToId,
          type: "ASSIGNED",
          message: `Вам назначена задача: ${task.title} в роли исполнителя`,
          taskId: task.id,
          boardId: task.boardId
        })
      );
    }
  
    // Если есть менеджер, админ назначил его, и это не сам админ — уведомляем менеджера
    if (task.responsibleId && creatorRole === 'ADMIN' && task.responsibleId !== creatorId) {
      notifications.push(
        this.createNotification({
          userId: task.responsibleId,
          type: "ASSIGNED",
          message: `Вам назначена задача: ${task.title} в роли менеджера`,
          taskId: task.id,
          boardId: task.boardId
        })
      );
    }
  
    await Promise.all(notifications);
  }
  
  
}
