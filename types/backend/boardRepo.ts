

import type { BoardBase, UpdateBoardData, CreateBoardData } from "../shared";


export type BoardRepository = {
  getBoardsForManagerOrClient(userId: string): Promise<BoardBase[]>;
  findById(boardId: string): Promise<BoardBase | null>;
  create(data: CreateBoardData): Promise<BoardBase>;
  update(boardId: string, data: UpdateBoardData): Promise<BoardBase>;
  archive(boardId: string): Promise<BoardBase>;
  getBoardsForExecutor(userId: string):Promise<BoardBase[]>
};

