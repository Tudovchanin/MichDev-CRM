

import BoardService from "~/server/services/BoardService";
import UserService from "~/server/services/UserService";
import {  prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import { assertValidUser, assertRole } from "#imports";
import { updateBoardSchema } from "~/server/validations/boards";
import { validateBody } from "#imports";

import type { BoardBase, UpdateBoardData, UserBase } from "~/types/shared";


const boardService = new BoardService(prismaBoardRepository);
const userService = new UserService(prismaUserRepository);

// доску update только менеджер(только свои) и админ(все доски)
export default defineEventHandler(async(e)=> {



  const boardId = getRouterParam(e, 'id');

  if (!boardId) {
    throw createError({ statusCode: 400, message: "Не указан id доски" });
  }

  const currentUser: UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  assertValidUser(currentUser);
  assertRole(currentUser, ["ADMIN", "MANAGER"]);



  const body: UpdateBoardData = await validateBody(updateBoardSchema, e);



  const board:BoardBase = await boardService.getBoardByIdForUser(
    currentUser.id,
    currentUser.role,
    boardId
  );


if (currentUser.role !== "ADMIN" && "managerId" in body) {
  throw createError({
    statusCode: 403,
    message: "У вас нет прав менять менеджера доски"
  });
}
  
  try {
    const updatedBoard:BoardBase = await boardService.updateBoard(boardId, body);
    return { board: updatedBoard, message: "Доска обновлена", };



  } catch (err) {
    throw err; 
  }
})