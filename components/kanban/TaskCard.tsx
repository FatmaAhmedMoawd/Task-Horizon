'use client';
import React from 'react';
import { Task } from '@/lib/types';
import { Clock, MessageSquare, Paperclip } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

export function TaskCard({ task }: { task: Task }) {
  const priorityColors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-emerald-100 text-emerald-700',
    high: 'bg-amber-100 text-amber-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-brand-300 transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex justify-between items-start mb-2">
        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded", priorityColors[task.priority])}>
          {task.priority}
        </span>
      </div>
      
      <h4 className="font-semibold text-slate-800 text-sm mb-1 group-hover:text-brand-600 transition-colors">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          {task.dueDate && (
             <div className={cn("flex items-center gap-1 text-xs font-medium", isOverdue ? "text-red-500" : "text-slate-500")}>
               <Clock className="w-3.5 h-3.5" />
               <span>{format(new Date(task.dueDate), 'MMM d')}</span>
             </div>
          )}
          <div className="flex items-center gap-1 text-xs text-slate-400">
             <MessageSquare className="w-3.5 h-3.5" />
             <span>0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           {task.estimate && (
             <span className="text-xs font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
               {task.estimate}
             </span>
           )}
           <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold ring-2 ring-white">
             {task.assignee.assigneeName.charAt(0)}
           </div>
        </div>
      </div>
    </div>
  );
}
