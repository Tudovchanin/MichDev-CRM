import UserService from "~/server/services/UserService";
import EmailService from "~/server/services/EmailService";
import { prismaUserRepository } from "~/server/repositories/prisma-repository";

const emailService = new EmailService();
const userService = new UserService(prismaUserRepository, emailService);

export default defineEventHandler(async (e) => {
  const config = useRuntimeConfig(e);
  const CLIENT_ACTIVATE_PAGE = config.activationRedirectURL;
  const CLIENT_ERROR_PAGE = config.activationErrorRedirectURL;
  
  const query = getQuery(e);
  const token = query.token as string | undefined;

  if (!token) {
    // Редирект на страницу ошибки, если токен отсутствует
    return sendRedirect(e, CLIENT_ERROR_PAGE);
  }

  try {
    // Попытка активации
    await userService.activateEmail(token);
    // Редирект на страницу успешной активации
    return sendRedirect(e, CLIENT_ACTIVATE_PAGE);
  } catch (error) {
    console.error('Email activation error:', error);
    // Редирект на страницу ошибки активации
    return sendRedirect(e, CLIENT_ERROR_PAGE);
  }
});

