import { CreateTaskInput, Task, UpdateTaskInput } from '../types';

const STORAGE_KEY = 'kanban_tasks_v1';
const LATENCY = 400; // ms
const ERROR_RATE = 0.05;

let memoryTasks: Task[] | null = null;

const loadFromStorage = (): Task[] => {
  if (memoryTasks) return memoryTasks;
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      memoryTasks = JSON.parse(stored);
      return memoryTasks!;
    } catch {
      console.error('Failed to parse tasks from storage');
    }
  }
  
  // Default Seed
  memoryTasks = [
    {
      id: `task-1`,
      title: 'Design Dashboard UX',
      description: 'Create wireframes for the new dashboard analytics view.',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      assignee: { assigneeId: 'u1', assigneeName: 'Alice' },
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: 0,
      tags: ['design'],
      archived: false,
      estimate: 5,
      lastMovedAt: new Date().toISOString(),
    },
    {
      id: `task-2`,
      title: 'Setup Next.js Repo',
      description: 'Initialize with App Router and Tailwind.',
      priority: 'urgent',
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      assignee: { assigneeId: 'u2', assigneeName: 'Bob' },
      status: 'done',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      order: 0,
      tags: ['dev'],
      archived: false,
      estimate: 3,
      lastMovedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    }
  ];
  saveToStorage(memoryTasks);
  return memoryTasks;
};

const saveToStorage = (tasks: Task[]) => {
  memoryTasks = tasks;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
};

const simulateNetwork = async () => {
  await new Promise(resolve => setTimeout(resolve, LATENCY));
  if (Math.random() < ERROR_RATE) {
    throw new Error('Simulated network failure. Please try again.');
  }
};

export const fetchTasks = async (): Promise<Task[]> => {
  await new Promise(resolve => setTimeout(resolve, LATENCY)); // Ignore error rate for initial fetch to be nice
  return loadFromStorage();
};

export const createTask = async (input: CreateTaskInput): Promise<Task> => {
  await simulateNetwork();
  const tasks = loadFromStorage();
  const newTask: Task = {
    ...input,
    id: `task-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    order: tasks.filter(t => t.status === input.status).length,
    lastMovedAt: new Date().toISOString(),
    archived: false,
  };
  saveToStorage([...tasks, newTask]);
  return newTask;
};

export const updateTask = async (id: string, input: UpdateTaskInput): Promise<Task> => {
  await simulateNetwork();
  const tasks = loadFromStorage();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Task not found');
  
  const updatedTask = {
    ...tasks[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  
  tasks[index] = updatedTask;
  saveToStorage([...tasks]);
  return updatedTask;
};

export const updateTasksBatch = async (updates: { id: string, data: UpdateTaskInput }[]): Promise<Task[]> => {
  await simulateNetwork();
  const tasks = loadFromStorage();
  
  const updatedTasks = updates.map(update => {
    const index = tasks.findIndex(t => t.id === update.id);
    if (index === -1) throw new Error(`Task ${update.id} not found`);
    
    const updatedTask = {
      ...tasks[index],
      ...update.data,
      updatedAt: new Date().toISOString(),
    };
    tasks[index] = updatedTask;
    return updatedTask;
  });
  
  saveToStorage([...tasks]);
  return updatedTasks;
};

export const deleteTask = async (id: string): Promise<void> => {
  await simulateNetwork();
  const tasks = loadFromStorage();
  saveToStorage(tasks.filter(t => t.id !== id));
};
