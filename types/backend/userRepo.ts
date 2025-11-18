// types/backend/userRepo.ts
import type { User, UserBase,UserBaseMinimal, UserResponseCounts, UserResponseFull } from '~/types/shared/user';

export type CreateUserData = Pick<User, 'name' | 'email' | 'password'>;
export type AuthenticateUserData = Pick<User, 'email' | 'password'>;
export type UpdateUserData = Partial<Pick<User, 'name' | 'email' | 'password' | 'avatar' | 'role' | 'isEmailConfirmed' | 'isBlocked'>>;


export type UserRepository = {
  findUsers(roles?: string[]): Promise<UserResponseCounts[]>;
  findByIdBasic(id: string): Promise<UserBase | null>
  findByIdWithCounts(id: string): Promise<UserResponseCounts | null>;
  findByEmailWithPassword(email: string): Promise<UserWithPassword | null>;
  create(userData: CreateUserData): Promise<UserBase>;
  update(id: string, data: UpdateUserData): Promise<UserBase>;
  deleteById(id: string): Promise<UserBaseMinimal>;
  findUsersByCondition(where: UserSearchConditions): Promise<UserBase[]>
};


export type UserWithPassword = UserResponseCounts & {
  password: string;
};


export type UserSearchConditions = {
  email?: string;
  name?: { contains: string; mode?: 'insensitive' };
  isBlocked?: boolean;
};