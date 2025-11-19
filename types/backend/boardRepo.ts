

import type { BoardBase, UpdateBoardData, CreateBoardData, BoardBaseMinimal } from "../shared";


export type BoardRepository = {
  getBoardsForAdmin(archived?: boolean): Promise<BoardBase[]>
  getBoardsForManagerOrClient(userId: string, archived?: boolean): Promise<BoardBase[]>;
  findById(boardId: string): Promise<BoardBase | null>;
  create(data: CreateBoardData): Promise<BoardBase>;
  update(boardId: string, data: UpdateBoardData): Promise<BoardBase>;
  getBoardsForExecutor(userId: string):Promise<BoardBase[]>;
  isUserAssignedToBoard(boardId: string, userId: string): Promise<boolean>;
  deleteById(id: string): Promise<BoardBaseMinimal>
};

