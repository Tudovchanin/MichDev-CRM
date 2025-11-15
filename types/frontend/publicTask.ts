import type { Task } from '~/types/shared/task';

export type PublicTask = Omit<Task, 'notifications'>;