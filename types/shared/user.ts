
import type { Board, Task, Comment, RefreshToken, Notification } from './index.ts';
import type { Role } from './enums';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: Role;
  isEmailConfirmed: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;

  boardsAsManager?: Board[];
  boardsAsClient?: Board[];
  tasksAssigned?: Task[];
  comments?: Comment[];
  refreshToken?: RefreshToken;
  notifications?: Notification[];
};
