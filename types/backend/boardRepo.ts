

import type { BoardBase, UpdateBoardData, CreateBoardData } from "../shared";


export type BoardRepository = {
  getBoardsForAdmin(archived?: boolean): Promise<BoardBase[]>
  getBoardsForManagerOrClient(userId: string, archived?: boolean): Promise<BoardBase[]>;
  findById(boardId: string): Promise<BoardBase | null>;
  create(data: CreateBoardData): Promise<BoardBase>;
  update(boardId: string, data: UpdateBoardData): Promise<BoardBase>;
  archive(boardId: string): Promise<BoardBase>;
  getBoardsForExecutor(userId: string):Promise<BoardBase[]>
};

