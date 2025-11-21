

import type { BoardBase, UpdateBoardData, CreateBoardData, BoardBaseMinimal } from "../shared";


export type BoardRepository = {
  getBoardsForAdmin(archived?: boolean): Promise<BoardBase[]>
  getBoardsForManagerOrClient(userId: string, archived?: boolean): Promise<BoardBase[]>;
  findById(boardId: string): Promise<BoardBase | null>;
  create(data: CreateBoardData): Promise<BoardBase>;
  update(boardId: string, data: UpdateBoardData): Promise<BoardBase>;
  getBoardsForExecutor(userId: string):Promise<BoardBase[]>;
  isExecutorAssignedToBoard(boardId: string, userId: string): Promise<boolean>;
  deleteById(id: string): Promise<BoardBaseMinimal>
};




export type BoardBaseNonNullManager = Omit<BoardBase, 'managerId'> & { managerId: string };