import UserService from "~/server/services/UserService";
import BoardService from "~/server/services/BoardService";
import type { BoardBase, UserBase } from "~/types/shared";
import { assertRole, assertValidUser } from "~/server/utils/auth";
import {
  prismaBoardRepository,
  prismaUserRepository,
} from "~/server/repositories/prisma-repository";


const userService = new UserService(prismaUserRepository);
const boardService = new BoardService(prismaBoardRepository);

export default defineEventHandler(async (e) => {

  const targetId = getRouterParam(e, "id")!;

  if (!targetId) {
    throw createError({ statusCode: 400, message: "Не указан id пользователя" });
  }
  try {

    const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

    assertValidUser(currentUser);
    assertRole(currentUser, 'ADMIN');

    const targetUser: UserBase = await userService.findByIdBasic(targetId);
    if (!targetUser) throw createError({ statusCode: 404, message: "Целевой пользователь не найден" });

    let boards: BoardBase[] = [];

    if (targetUser.role === "CLIENT" || targetUser.role === "MANAGER") {
      boards = await boardService.getBoardsForManagerOrClient(targetId);
    } else if (targetUser.role === "EXECUTOR") {
      boards = await boardService.getBoardsForExecutor(targetId);
    }



    return { user: targetUser, boards };

  } catch (error) {
    throw error;
  }
});
