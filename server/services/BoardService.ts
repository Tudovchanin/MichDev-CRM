
import type { BoardRepository } from "~/types/backend/boardRepo";
import type { BoardBase, UpdateBoardData, CreateBoardData, BoardBaseMinimal } from "~/types/shared";


export class BoardService {

  constructor(
    private boardRepository: BoardRepository
  ) { }

  async getBoardById(boardId: string) {
    const board = await this.boardRepository.findById(boardId);
    if (!board) {
      throw createError({ statusCode: 404, message: 'Доска не найдена' });
    }
    return board;
  }

  async createBoard(data: CreateBoardData): Promise<BoardBase> {
    const board = await this.boardRepository.create(data);
    return board;
  }

  async updateBoard(boardId: string, data: UpdateBoardData) {
    return this.boardRepository.update(boardId, data);
  }

  async getBoardsForAdmin(archived?: boolean) {
    return this.boardRepository.getBoardsForAdmin(archived);
  }

  async getBoardsForManagerOrClient(userId: string, archived?: boolean) {
    return this.boardRepository.getBoardsForManagerOrClient(userId, archived);
  }

  async getBoardsForExecutor(userId: string): Promise<BoardBase[]> {
    return this.boardRepository.getBoardsForExecutor(userId);
  }

  async getBoardByIdForUser(userId: string, role: string, boardId: string): Promise<BoardBase> {

    const board = await this.boardRepository.findById(boardId);

    if (!board) {
      throw createError({ statusCode: 404, message: 'Доска не найдена' });
    }

    switch (role) {
      case 'ADMIN':
        return board;

      case 'MANAGER':
      case 'CLIENT':
        if (board.managerId !== userId && board.clientId !== userId) {
          throw createError({ statusCode: 403, message: 'Нет прав доступа к доске' });
        }
        return board;

      case 'EXECUTOR':
        const isAssigned = await this.boardRepository.isExecutorAssignedToBoard(boardId, userId);
        if (!isAssigned) {
          throw createError({ statusCode: 403, message: 'Нет прав доступа к доске' });
        }
        return board;

      default:
        throw createError({ statusCode: 403, message: 'Нет прав доступа' });
    }
  }
  
  async getBoardsByUser(userId: string, role: string): Promise<BoardBase[]> {
    switch (role) {
      case "ADMIN":
        return this.getBoardsForAdmin();
      case "MANAGER":
      case "CLIENT":
        return this.getBoardsForManagerOrClient(userId);
      case "EXECUTOR":
        return this.getBoardsForExecutor(userId);
      default:
        return [];
    }
  }

  async deleteBoard(boardId: string): Promise<BoardBaseMinimal> {
    return this.boardRepository.deleteById(boardId);
  }

}


export default BoardService;