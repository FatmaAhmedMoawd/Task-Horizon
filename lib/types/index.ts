export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'todo' | 'in_progress' | 'done';

export interface Assignee {
  assigneeId: string;
  assigneeName: string;
  avatarUrl?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  assignee: Assignee;
  status: Status;
  createdAt: string;
  updatedAt: string;
  order: number;
  tags: string[];
  archived: boolean;
  estimate: number | null;
  lastMovedAt: string;
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order' | 'lastMovedAt' | 'archived'>;
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>;
