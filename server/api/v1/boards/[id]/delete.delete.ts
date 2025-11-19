

import BoardService from "~/server/services/BoardService";
import UserService from "~/server/services/UserService";
import { prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import { assertValidUser, assertRole } from "#imports";
import type { BoardBaseMinimal, UserBase } from "~/types/shared";

const boardService = new BoardService(prismaBoardRepository);
const userService = new UserService(prismaUserRepository);

export default defineEventHandler(async (e) => {

  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  assertValidUser(currentUser);
  assertRole(currentUser, ["ADMIN"]);

  const boardId = getRouterParam(e, "id");
  if (!boardId) {
    throw createError({ statusCode: 400, message: "Не указан id доски" });
  }

  try {
    const deletedBoard: BoardBaseMinimal = await boardService.deleteBoard(boardId);
    return {
      board: deletedBoard,
      message: `Доска "${deletedBoard.name}" удалена`
    };
  } catch (err) {
    throw err;
  }
});
