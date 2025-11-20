import prisma from "~/lib/prisma";
import type {
  CreateUserData,
  UserRepository,
  UpdateUserData,
  UserSearchConditions,
} from "~/types/backend/userRepo";
import type {
  UserResponseCounts,
  UserBase,
  UserBaseMinimal,
} from "~/types/shared";
import type { UserWithPassword } from "~/types/backend/userRepo";
import type {
  BoardBase,
  UpdateBoardData,
  CreateBoardData,
  BoardBaseMinimal,
} from "~/types/shared";
import type { PaginationOptions } from "~/types/shared";
import type { BoardRepository } from "~/types/backend/boardRepo";
import type { RefreshTokenRepository } from "~/types/backend/tokenRepo";
import type { TaskRepository, CreateTaskData, UpdateTaskData } from "~/types/backend/taskRepo";
import type { TaskBase, TaskFilters, TaskBaseMinimal } from "~/types/shared";



export const prismaUserRepository: UserRepository = {
  async findByIdWithCounts(id: string): Promise<UserResponseCounts | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isEmailConfirmed: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasksAssigned: true,
            boardsAsManager: true,
            boardsAsClient: true,
            comments: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      isEmailConfirmed: user.isEmailConfirmed,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      tasksAssignedCount: user._count.tasksAssigned,
      boardsAsManagerCount: user._count.boardsAsManager,
      boardsAsClientCount: user._count.boardsAsClient,
      commentsCount: user._count.comments,
      notificationsCount: user._count.notifications,
    };
  },

  async findByIdBasic(id: string): Promise<UserBase | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isEmailConfirmed: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async getPasswordUserById(id: string): Promise<{ password: string } | null> {
    return prisma.user.findUnique({
      where: { id },
      select: {
        password: true,
      },
    });
  },

  async findUsers(roles?: string[]): Promise<UserResponseCounts[]> {
    const where: any = {};
    if (roles?.length) {
      where.role = { in: roles };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isEmailConfirmed: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasksAssigned: true,
            boardsAsManager: true,
            boardsAsClient: true,
            comments: true,
            notifications: true,
          },
        },
      },
    });

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar,
      role: u.role,
      isEmailConfirmed: u.isEmailConfirmed,
      isBlocked: u.isBlocked,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      tasksAssignedCount: u._count.tasksAssigned,
      boardsAsManagerCount: u._count.boardsAsManager,
      boardsAsClientCount: u._count.boardsAsClient,
      commentsCount: u._count.comments,
      notificationsCount: u._count.notifications,
    }));
  },

  async findByEmailWithPassword(
    email: string
  ): Promise<UserWithPassword | null> {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        avatar: true,
        role: true,
        isEmailConfirmed: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tasksAssigned: true,
            boardsAsManager: true,
            boardsAsClient: true,
            comments: true,
            notifications: true,
          },
        },
      },
    });

    if (!user) return null;

    const userWithPassword: UserWithPassword = {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      avatar: user.avatar,
      role: user.role,
      isEmailConfirmed: user.isEmailConfirmed,
      isBlocked: user.isBlocked,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      tasksAssignedCount: user._count.tasksAssigned,
      boardsAsManagerCount: user._count.boardsAsManager,
      boardsAsClientCount: user._count.boardsAsClient,
      commentsCount: user._count.comments,
      notificationsCount: user._count.notifications,
    };

    return userWithPassword;
  },

  async create(userData: CreateUserData): Promise<UserBase> {
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isEmailConfirmed: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },

  async update(id: string, data: UpdateUserData): Promise<UserBase> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          isEmailConfirmed: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return user;
    } catch (err: any) {
      if (err.code === "P2025") {
        throw createError({
          statusCode: 404,
          message: "Пользователь не найден",
        });
      }
      throw err;
    }
  },

  async deleteById(id: string): Promise<UserBaseMinimal> {
    try {
      const user = await prisma.user.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      return user;
    } catch (err: any) {
      if (err.code === "P2025") {
        throw createError({
          statusCode: 404,
          message: "Пользователь не найден",
        });
      }
      throw err;
    }
  },

  async findUsersByCondition(where: UserSearchConditions): Promise<UserBase[]> {
    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        isEmailConfirmed: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },
};

export const prismaBoardRepository: BoardRepository = {
  
  async getBoardsForAdmin(archived?: boolean): Promise<BoardBase[]> {
    return prisma.board.findMany({
      where: {
        ...(archived !== undefined ? { isArchived: archived } : {}),
      },
      select: {
        id: true,
        name: true,
        clientEmail: true,
        clientId: true,
        managerId: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async getBoardsForManagerOrClient(
    userId: string,
    archived?: boolean
  ): Promise<BoardBase[]> {
    return prisma.board.findMany({
      where: {
        OR: [{ managerId: userId }, { clientId: userId }],
        ...(archived !== undefined ? { isArchived: archived } : {}),
      },
      select: {
        id: true,
        name: true,
        clientEmail: true,
        clientId: true,
        managerId: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async getBoardsForExecutor(userId: string): Promise<BoardBase[]> {
    // Получаем уникальные boardId прямо из базы
    const result = await prisma.task.groupBy({
      by: ["boardId"],
      where: { assignedToId: userId },
    });

    const boardIds = result.map((r) => r.boardId);

    if (boardIds.length === 0) return [];

    // Получаем доски по этим id
    const boards = await prisma.board.findMany({
      where: { id: { in: boardIds } },
      select: {
        id: true,
        name: true,
        clientEmail: true,
        clientId: true,
        managerId: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return boards;
  },

  async findById(boardId: string): Promise<BoardBase | null> {
    return prisma.board.findUnique({
      where: { id: boardId },
      select: {
        id: true,
        name: true,
        clientEmail: true,
        clientId: true,
        managerId: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async create(data: CreateBoardData): Promise<BoardBase> {
    return prisma.board.create({
      data,
      select: {
        id: true,
        name: true,
        clientEmail: true,
        clientId: true,
        managerId: true,
        isArchived: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // так же можно добавить в архив или восстановить
  async update(boardId: string, data: UpdateBoardData): Promise<BoardBase> {
    try {
      const board = await prisma.board.update({
        where: { id: boardId },
        data,
        select: {
          id: true,
          name: true,
          clientEmail: true,
          clientId: true,
          managerId: true,
          isArchived: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return board;
    } catch (err: any) {
      if (err.code === "P2025") {
        throw createError({
          statusCode: 404,
          message: "Пользователь не найден",
        });
      }
      throw err;
    }
  },

  // проверяем есть ли исполнитель в доске, так как исполнители только к задачам привязаны
  async isUserAssignedToBoard(
    boardId: string,
    userId: string
  ): Promise<boolean> {
    const task = await prisma.task.findFirst({
      where: { boardId, assignedToId: userId },
      select: { id: true },
    });
    return !!task;
  },

  async deleteById(id: string): Promise<BoardBaseMinimal> {
    try {
      const board = await prisma.board.delete({
        where: { id },
        select: {
          id: true,
          name: true,
          clientEmail: true,
        },
      });
      return board;
    } catch (err: any) {
      if (err.code === "P2025") {
        throw createError({ statusCode: 404, message: "Доска не найдена" });
      }
      throw err;
    }
  },
};

export const prismaRefreshTokenRepository: RefreshTokenRepository = {
  async findByUserId(userId: string) {
    return prisma.refreshToken.findUnique({ where: { userId } });
  },

  async saveToken(userId: string, token: string, expiresAt: Date) {
    return prisma.refreshToken.upsert({
      where: { userId },
      update: {
        token,
        expiresAt,
        createdAt: new Date(),
      },
      create: {
        userId,
        token,
        expiresAt,
      },
    });
  },

  async deleteToken(userId: string) {
    return prisma.refreshToken.delete({ where: { userId } });
  },
};



export const prismaTaskRepository: TaskRepository = {

  async findById(taskId:string):Promise<TaskBase | null>  {

    return prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        order: true,
        boardId: true,
        assignedToId: true,
        responsibleId: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async createTask(data: CreateTaskData): Promise<TaskBase> {
    return prisma.task.create({
      data,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        order: true,
        boardId: true,
        assignedToId: true,
        responsibleId: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async updateTask(data: UpdateTaskData): Promise<TaskBase> {


    try {
      return prisma.task.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          status: data.status,
          assignedToId: data.assignedToId,
          responsibleId: data.responsibleId,
          order: data.order,
          deadline: data.deadline,
        },
      });
      
    } catch (err:any) {
      if (err.code === "P2025") {
        throw createError({
          statusCode: 404,
          message: "Пользователь не найден",
        });
      }
      throw err;
    }
  
  },

  async getAllTasks({
    skip = 0,
    take = 20,
    status,
    assignedToId,
    responsibleId,
    boardId
  }: PaginationOptions & TaskFilters = {}): Promise<TaskBase[]> {
    return prisma.task.findMany({
      skip,
      take,
      where: {
        ...(boardId ? { boardId } : {}),
        ...(status ? { status } : {}),
        ...(assignedToId !== undefined ? { assignedToId } : {}),
        ...(responsibleId !== undefined ? { responsibleId } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        order: true,
        boardId: true,
        assignedToId: true,
        responsibleId: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async getTasksForExecutor(
    userId: string,
    {
      skip = 0,
      take = 20,
      status,
      responsibleId,
      boardId
    }: PaginationOptions & TaskFilters = {}
  ): Promise<TaskBase[]> {
    return prisma.task.findMany({
      skip,
      take,
      where: {
        assignedToId: userId,
        ...(boardId ? { boardId } : {}),
        ...(status ? { status } : {}),
        ...(responsibleId ? { responsibleId } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        order: true,
        boardId: true,
        assignedToId: true,
        responsibleId: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async getTasksByBoard(
    boardId: string,
    {
      status,
      assignedToId,
      responsibleId,
    }: PaginationOptions & TaskFilters = {}
  ): Promise<TaskBase[]> {
    return prisma.task.findMany({
      where: {
        boardId,
        ...(status ? { status } : {}),
        ...(assignedToId !== undefined ? { assignedToId } : {}),
        ...(responsibleId !== undefined ? { responsibleId } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        order: true,
        boardId: true,
        assignedToId: true,
        responsibleId: true,
        deadline: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        order: "asc",
      },
    });
  },

  async deleteById(id: string): Promise<TaskBaseMinimal> {
    try {
      const task = await prisma.task.delete({
        where: { id },
        select: {
          id: true,
          title: true,
          boardId: true,
        },
      });
      return task;
    } catch (err: any) {
      if (err.code === "P2025") {
        throw createError({ statusCode: 404, message: "Доска не найдена" });
      }
      throw err;
    }
  },
};
