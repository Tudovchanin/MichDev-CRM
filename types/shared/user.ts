
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


export type UserBase = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: Role;
  isEmailConfirmed: boolean;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date; 
};

export type UserBaseMinimal = Pick<UserBase, 'id' | 'name' | 'email'>;



export type UserResponseCounts = UserBase & {
  tasksAssignedCount: number;
  boardsAsManagerCount: number;
  boardsAsClientCount: number;
  commentsCount: number;
  notificationsCount: number;
};

export type UserResponseFull = UserBase & {
  tasksAssigned: Task[];
  boardsAsManager: Board[];
  boardsAsClient: Board[];
  comments: Comment[];
  notifications: Notification[];
};