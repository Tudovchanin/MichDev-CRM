// types/backend/userRepo.ts
import type { User } from '~/types/shared/user';

export type CreateUserData = Pick<User, 'name' | 'email' | 'password'>;
export type AuthenticateUserData = Pick<User, 'email' | 'password'>;
export type UpdateUserData = Partial<Pick<User, 'name' | 'email' | 'password' | 'avatar' | 'role' | 'isEmailConfirmed'>>;



export type UserRepository = {
  findAll(): Promise<Partial<User>[]>;
  findById(id: string): Promise<User | null>;
  findActiveById(id: string): Promise<{ isBlocked: boolean } | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  deleteUserById(id: string): Promise<User>;
};