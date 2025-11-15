import type { User, Task } from './index';
import type { NotificationType } from './enums';

export type Notification = {
  id: string;
  userId: string;
  boardId?: string | null;
  taskId?: string | null;
  type: NotificationType;
  message: string;
  meta?: any | null;
  isRead: boolean;
  createdAt: Date;

  user?: User;
  task?: Task | null;
};
