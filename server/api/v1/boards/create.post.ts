
import UserService from "~/server/services/UserService";
import BoardService from "~/server/services/BoardService";
import { prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import { validateBody } from "~/server/utils/validate";
import { createBoardSchema } from "~/server/validations/boards";
import { assertValidUser, assertRole } from "~/server/utils/auth";
import type { UserBase } from "~/types/shared";


const userService = new UserService(prismaUserRepository);
const boardService = new BoardService(prismaBoardRepository);


export default defineEventHandler(async(e)=> {


  const currentUser:UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  assertValidUser(currentUser);
  assertRole(currentUser, ['ADMIN', 'MANAGER'])


  const body:{name:string, clientEmail:string, managerId:string | null } = await validateBody(createBoardSchema, e);

  // Проверяем, есть ли зарегистрированный клиент с этим email
  const client = await userService.findUserByEmail(body.clientEmail);

  const data = {
    name: body.name,
    clientEmail: body.clientEmail,
    clientId: client?.id ?? null,
    managerId: currentUser.role === "ADMIN" && body.managerId ? body.managerId : currentUser.id,
    isArchived: false,
  };

  try {

    const board = await boardService.createBoard(data);

    return { board };
    
  } catch (error) {
    throw(error)
  }

})