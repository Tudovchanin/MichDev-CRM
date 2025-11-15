
import prisma from "~/lib/prisma";


import type { CreateUserData, UserRepository } from "~/types/backend/userRepo";
import type { RefreshTokenRepository } from "~/types/backend/tokenRepo";


export const prismaUserRepository: UserRepository = {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findActiveById(id:string) {
    const userIsActive =  await prisma.user.findUnique({
      where: { id: id },
      select: { isBlocked: true } // ← Получаем только поле isActive
    });

    return userIsActive
  },
 
  async findAll() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  },
  
  async create(userData: CreateUserData) {
    return prisma.user.create({ data: userData });
  },

  async update(id: string, data: Partial<any>) {
    return prisma.user.update({ where: { id }, data });
  },

  async deleteUserById(id: string) {
    return prisma.user.delete({ where: { id } });
  }
};


export const prismaRefreshTokenRepository: RefreshTokenRepository = {
  async findByUserId(userId: string) {
    return prisma.refreshToken.findUnique({ where: { userId } });
  },

  async saveToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.upsert({
      where: { userId },
      update: {
        token,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        userId,
        token,
        expiresAt,
      },
    });
  },

  async deleteToken(userId: string) {
    return prisma.refreshToken.delete({ where: { userId } });
  },

};