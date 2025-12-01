import { Todo } from '@prisma/client';

export type { Todo };

export interface TodoWithDependencies extends Todo {
  dependencies: Todo[];
}