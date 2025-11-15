
import type { Board } from '~/types/shared/board';

export type PublicBoard = Omit<Board, 'tasks' | 'comments'>;
