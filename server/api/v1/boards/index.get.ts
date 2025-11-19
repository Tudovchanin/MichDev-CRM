

import UserService from "~/server/services/UserService";
import BoardService from "~/server/services/BoardService";
import { prismaUserRepository, prismaBoardRepository } from "~/server/repositories/prisma-repository";
import { assertValidUser } from "~/server/utils/auth";
import { validateQuery } from "~/server/utils/validate"
import { queryBoardsSchema } from "~/server/validations/boards";
import type { UserBase} from "~/types/shared";
import type { BoardBase } from "~/types/shared";

const userService = new UserService(prismaUserRepository);
const boardService = new BoardService(prismaBoardRepository);


export default defineEventHandler(async(e)=> {


  const query:{archived: string | undefined } = validateQuery(queryBoardsSchema, e);

  const archived = query.archived === 'true'; 


//  текущий пользователь
  const userId = e.context.currentUserPayload.sub;


  const currentUser:UserBase = await userService.findByIdBasic(userId);
  assertValidUser(currentUser);
  let boards: BoardBase[] = [];

  try {

  switch (currentUser.role) {
    case 'ADMIN':
      boards = await boardService.getBoardsForAdmin(archived);
      break;
    case 'MANAGER':
    case 'CLIENT':
      boards = await boardService.getBoardsForManagerOrClient(userId, archived);
      break;
    case 'EXECUTOR':
      boards = await boardService.getBoardsForExecutor(userId);
      break;
    default:
      throw createError({ statusCode: 500, message: 'Неизвестная роль' });
  }

  return { boards };
    
  } catch (error) {
    throw error;
  }


})