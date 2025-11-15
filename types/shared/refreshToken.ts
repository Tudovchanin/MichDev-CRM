import type { User } from './index';

export type RefreshToken = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;

  user?: User;
};
