
import UserService from "~/server/services/UserService";
import BoardService from "~/server/services/BoardService";
import { prismaBoardRepository, prismaUserRepository } from "~/server/repositories/prisma-repository";
import { validateBody } from "~/server/utils/validate";
import { createBoardSchema } from "~/server/validations/boards";
import { assertValidUser, assertRole } from "~/server/utils/auth";
import type { BoardBase, UserBase } from "~/types/shared";
import type { BoardBaseNonNullManager } from "~/types/backend/boardRepo";

const userService = new UserService(prismaUserRepository);
const boardService = new BoardService(prismaBoardRepository);


export default defineEventHandler(async(e)=> {


  const currentUser:UserBase = await userService.findByIdBasic(e.context.currentUserPayload.sub);

  assertValidUser(currentUser);
  assertRole(currentUser, ['ADMIN', 'MANAGER'])


  const body:{name:string, clientEmail:string, managerId?:string | null } = await validateBody(createBoardSchema, e);

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

    // сервис запишет менеджера из тела запроса или автоматом запишет самого пользователя(доску создают только админы и менеджеры) в роли менеджера. Поэтому тип BoardBaseNonNullManager, так как при создании доски колонка managerId  не может быть пустой(пустой может если админ удалит менеджера)
    const board:BoardBaseNonNullManager = await boardService.createBoard(data) as BoardBaseNonNullManager;

    return { board };
    
  } catch (error) {
    throw(error)
  }

})