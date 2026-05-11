import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Task, CreateTaskInput, UpdateTaskInput, Status } from '../types';
import * as api from '../api/client';

interface KanbanState {
  tasks: Record<string, Task>;
  taskIdsByStatus: Record<Status, string[]>;
  isLoading: boolean;
  error: string | null;
  activeDragTaskId: string | null;
  hasHydratedFromStorage: boolean;
  filters: {
    search: string;
    priority: string | null;
    assigneeId: string | null;
  }
}

const initialState: KanbanState = {
  tasks: {},
  taskIdsByStatus: {
    todo: [],
    in_progress: [],
    done: [],
  },
  isLoading: false,
  error: null,
  activeDragTaskId: null,
  hasHydratedFromStorage: false,
  filters: {
    search: '',
    priority: null,
    assigneeId: null,
  }
};

export const fetchAllTasks = createAsyncThunk('kanban/fetchAll', async () => {
  return await api.fetchTasks();
});

export const createNewTask = createAsyncThunk('kanban/createTask', async (input: CreateTaskInput) => {
  return await api.createTask(input);
});

export const updateTaskData = createAsyncThunk('kanban/updateTask', async ({ id, data }: { id: string, data: UpdateTaskInput }) => {
  return await api.updateTask(id, data);
});

export const moveTaskCommit = createAsyncThunk(
  'kanban/moveTaskCommit',
  async ({ taskId, fromStatus, toStatus, previousState }: { taskId: string, fromStatus: Status, toStatus: Status, previousState: KanbanState }, { getState }) => {
    try {
      const state = (getState() as { kanban: KanbanState }).kanban;
      const updates: { id: string, data: UpdateTaskInput }[] = [];
      
      // Sync destination column orders
      state.taskIdsByStatus[toStatus].forEach(id => {
        const t = state.tasks[id];
        updates.push({ id, data: { status: t.status, order: t.order, lastMovedAt: t.lastMovedAt } });
      });

      // Sync source column orders if inter-column drop
      if (fromStatus !== toStatus) {
         state.taskIdsByStatus[fromStatus].forEach(id => {
            const t = state.tasks[id];
            // Don't need to push the moved task again as its order is already synchronized in destination
            if (id !== taskId) {
              updates.push({ id, data: { status: t.status, order: t.order } });
            }
         });
      }

      return await api.updateTasksBatch(updates);
    } catch (error: any) {
      throw { ...error, previousState };
    }
  }
);

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    setActiveDragTaskId(state, action: PayloadAction<string | null>) {
      state.activeDragTaskId = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<KanbanState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    moveTaskOptimistic(state, action: PayloadAction<{ taskId: string, toStatus: Status, toIndex: number }>) {
      const { taskId, toStatus, toIndex } = action.payload;
      const task = state.tasks[taskId];
      if (!task) return;

      const fromStatus = task.status;
      
      // Remove from old status list
      state.taskIdsByStatus[fromStatus] = state.taskIdsByStatus[fromStatus].filter(id => id !== taskId);
      
      // Add to new status list at correct index
      const newStatusList = [...state.taskIdsByStatus[toStatus]];
      newStatusList.splice(toIndex, 0, taskId);
      state.taskIdsByStatus[toStatus] = newStatusList;
      
      // Update task status and lastMovedAt optimistically
      state.tasks[taskId].status = toStatus;
      if (fromStatus !== toStatus) {
         state.tasks[taskId].lastMovedAt = new Date().toISOString();
      }

      // Sync sequence values locally
      state.taskIdsByStatus[toStatus].forEach((id, idx) => {
         state.tasks[id].order = idx;
      });
      if (fromStatus !== toStatus) {
         state.taskIdsByStatus[fromStatus].forEach((id, idx) => {
            state.tasks[id].order = idx;
         });
      }
    },
    rollbackMove(state, action: PayloadAction<{ previousState: KanbanState }>) {
       return action.payload.previousState;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hasHydratedFromStorage = true;
        
        const tasksMap: Record<string, Task> = {};
        const idsByStatus: Record<Status, string[]> = { todo: [], in_progress: [], done: [] };
        
        action.payload.forEach(task => {
          tasksMap[task.id] = task;
          idsByStatus[task.status].push(task.id);
        });

        // Sort each status array by order
        (Object.keys(idsByStatus) as Status[]).forEach(status => {
           idsByStatus[status].sort((a, b) => tasksMap[a].order - tasksMap[b].order);
        });

        state.tasks = tasksMap;
        state.taskIdsByStatus = idsByStatus;
      })
      .addCase(fetchAllTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load tasks';
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
         const task = action.payload;
         state.tasks[task.id] = task;
         state.taskIdsByStatus[task.status].push(task.id);
      })
      .addCase(moveTaskCommit.rejected, (state, action) => {
         // Return previous state directly from rejected handler to effectively rollback RTK drafted changes
         if (action.meta.arg.previousState) {
            return {
              ...action.meta.arg.previousState,
              error: 'Failed to save move. Reverting...'
            };
         }
      })
      .addCase(updateTaskData.fulfilled, (state, action) => {
          const task = action.payload;
          state.tasks[task.id] = task;
          // Re-sort column if order changed maybe, but sticking to simple updates here
      });
  }
});

export const { setActiveDragTaskId, setFilters, moveTaskOptimistic, rollbackMove } = kanbanSlice.actions;
export default kanbanSlice.reducer;
