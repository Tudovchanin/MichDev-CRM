
import BoardService from "~/server/services/BoardService";
import UserService from "~/server/services/UserService";
import {  prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import type { UserBase } from "~/types/shared";
const userService = new UserService(prismaUserRepository);

const boardService = new BoardService(prismaBoardRepository);


export default defineEventHandler(async(e)=> {

  const currentUser:UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);
  assertValidUser(currentUser);
  
  const boardId = getRouterParam(e, 'id');
  if (!boardId) {
    throw createError({ statusCode: 400, message: "Не указан id доски" });
  }
  
  try {
    const board = await boardService.getBoardByIdForUser(
      currentUser.id,
      currentUser.role,
      boardId
    );

    return { board };
  } catch (err) {
    throw err; 
  }
})