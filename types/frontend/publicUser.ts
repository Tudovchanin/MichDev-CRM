import type { User } from '~/types/shared/user';

export type PublicUser = Omit<User, 'password' | 'refreshToken'>;