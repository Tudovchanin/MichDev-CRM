
import type { BoardRepository } from "~/types/backend/boardRepo";
import type { BoardBase, UpdateBoardData, CreateBoardData } from "~/types/shared";


export  class BoardService {

constructor(
  private boardRepository:BoardRepository
){}

async getBoardById(boardId: string) {
  const board = await this.boardRepository.findById(boardId);
  if (!board) {
    throw createError({ statusCode: 404, message: 'Доска не найдена' });
  }
  return board;
}

async createBoard(data: CreateBoardData):Promise<BoardBase> {
  const board = await this.boardRepository.create(data);
  return board;
}


async updateBoard(boardId: string, data: UpdateBoardData) {
  return this.boardRepository.update(boardId, data);
}

async archiveBoard(boardId: string) {
  return this.boardRepository.archive(boardId);
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

}


export default BoardService;