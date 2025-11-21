
import NotificationService from "~/server/services/NotificationService";
import UserService from "~/server/services/UserService";
import { prismaNotificationRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import type { UserBase } from "~/types/shared";

const notificationService = new NotificationService(prismaNotificationRepository);
const userService = new UserService(prismaUserRepository);

export default defineEventHandler(async (e) => {
  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);


  if (!currentUser) throw createError({ statusCode: 404, message: "Пользователь не найден" });
  
  assertRole(currentUser, ["ADMIN", "MANAGER", "CLIENT", "EXECUTOR"]);

  try {

    const count = await notificationService.markAllAsRead(currentUser.id);

    return {
      updated: count,
    };
    
  } catch (err) {
    throw(err)
  }
 
});
