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
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
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
    await dispatch(createNewTask(data as CreateTaskInput)).unwrap();
    reset();
    onClose();
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
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Title <span className="text-red-500">*</span></label>
              <input 
                {...register('title')}
                className="w-full px-4 py-2.5 min-h-[44px] text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                placeholder="E.g., Design new landing page"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500 font-medium">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea 
                {...register('description')}
                rows={4}
                className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow resize-none"
                placeholder="Add more details about this task..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                <select 
                  {...register('status')}
                  className="w-full px-4 py-2.5 min-h-[44px] text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Priority</label>
                <select 
                  {...register('priority')}
                  className="w-full px-4 py-2.5 min-h-[44px] text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Note: In a real app we'd have a proper assigning dropdown, simplified here */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Due Date</label>
              <input 
                {...register('dueDate')}
                type="date"
                className="w-full px-4 py-2.5 min-h-[44px] text-base border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
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
