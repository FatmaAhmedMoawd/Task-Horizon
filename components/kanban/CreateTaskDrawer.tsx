'use client';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { CreateTaskSchema } from '@/lib/schemas/task';
import { useAppDispatch } from '@/lib/store/hooks';
import { createNewTask } from '@/lib/store/kanbanSlice';
import { CreateTaskInput } from '@/lib/types';
import * as z from 'zod';

interface CreateTaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormValues = z.infer<typeof CreateTaskSchema>;

export function CreateTaskDrawer({ isOpen, onClose }: CreateTaskDrawerProps) {
  const dispatch = useAppDispatch();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
    resolver: zodResolver(CreateTaskSchema),
    defaultValues: {
      status: 'todo',
      priority: 'medium',
      description: '',
      assignee: { assigneeId: 'u1', assigneeName: 'Alice' }
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data: FormValues) => {
    try {
      await dispatch(createNewTask(data as CreateTaskInput)).unwrap();
      reset();
      onClose();
    } catch (error: any) {
      setError('root', { type: 'manual', message: error?.message || 'Failed to create task' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Create New Task</h2>
          <button 
            onClick={onClose}
            aria-label="Close drawer"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center rounded-full transition-colors min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="p-3 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200">
                {errors.root.message}
              </div>
            )}
            
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">Title <span className="text-red-500">*</span></label>
              <input 
                id="title"
                {...register('title')}
                className={`w-full px-4 py-2.5 min-h-[44px] text-base border ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-brand-500'} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`}
                placeholder="E.g., Design new landing page"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500 font-medium">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea 
                id="description"
                {...register('description')}
                rows={4}
                className={`w-full px-4 py-3 text-base border ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-brand-500'} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-shadow resize-none`}
                placeholder="Add more details about this task..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-500 font-medium">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select 
                  id="status"
                  {...register('status')}
                  className={`w-full px-4 py-2.5 min-h-[44px] text-base border ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-brand-500'} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white`}
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-500 font-medium">{errors.status.message}</p>}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <select 
                  id="priority"
                  {...register('priority')}
                  className={`w-full px-4 py-2.5 min-h-[44px] text-base border ${errors.priority ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-brand-500'} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white`}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                {errors.priority && <p className="mt-1 text-sm text-red-500 font-medium">{errors.priority.message}</p>}
              </div>
            </div>

            {/* Note: In a real app we'd have a proper assigning dropdown, simplified here */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
              <input 
                id="dueDate"
                {...register('dueDate')}
                type="date"
                className={`w-full px-4 py-2.5 min-h-[44px] text-base border ${errors.dueDate ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-brand-500'} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-white transition-shadow`}
              />
              {errors.dueDate && <p className="mt-1 text-sm text-red-500 font-medium">{errors.dueDate.message}</p>}
            </div>

          </form>
        </div>

        <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 flex gap-4 justify-end shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-base text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl font-semibold transition-colors min-h-[48px] w-full sm:w-auto"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="create-task-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 text-base text-white bg-brand-600 hover:bg-brand-700 focus:ring-4 focus:ring-brand-200 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px] min-h-[48px] w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
