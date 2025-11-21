
import NotificationService from "~/server/services/NotificationService";
import UserService from "~/server/services/UserService";
import { prismaNotificationRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import type { NotificationBase, UserBase } from "~/types/shared";

const notificationService = new NotificationService(prismaNotificationRepository);
const userService = new UserService(prismaUserRepository);

export default defineEventHandler(async (e) => {
  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);
  
  if (!currentUser) throw createError({ statusCode: 404, message: "Пользователь не найден" });
  
  // если пользователь заблокирован или почта не подтверждена, уведомления работают
  // assertValidUser(currentUser);

  try {

  const notifications:NotificationBase[] = await notificationService.getUserNotifications(currentUser.id);
  return { notifications };
    
  } catch (err) {
    
    throw(err)
  }
  
});
