'use client';
import React from 'react';
import { Task } from '@/lib/types';
import { Clock, MessageSquare, Paperclip } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

export function TaskCard({ task }: { task: Task }) {
  const priorityColors = {
    low: 'bg-slate-100 text-slate-700',
    medium: 'bg-emerald-100 text-emerald-800',
    high: 'bg-amber-100 text-amber-900',
    urgent: 'bg-red-100 text-red-800',
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'done';

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-brand-300 transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex justify-between items-start mb-3">
        <span className={cn("text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md", priorityColors[task.priority])}>
          {task.priority}
        </span>
      </div>
      
      <h4 className="font-semibold text-slate-800 text-base mb-2 group-hover:text-brand-600 transition-colors">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-4">
          {task.dueDate && (
             <div className={cn("flex items-center gap-1.5 text-sm font-medium", isOverdue ? "text-red-500" : "text-slate-500")}>
               <Clock className="w-4 h-4" />
               <span>{format(new Date(task.dueDate), 'MMM d')}</span>
             </div>
          )}
          <div className="flex items-center gap-1.5 text-sm text-slate-400">
             <MessageSquare className="w-4 h-4" />
             <span>0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           {task.estimate && (
             <span className="text-sm font-medium bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
               {task.estimate}
             </span>
           )}
           <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold ring-2 ring-white">
             {task.assignee.assigneeName.charAt(0)}
           </div>
        </div>
      </div>
    </div>
  );
}
