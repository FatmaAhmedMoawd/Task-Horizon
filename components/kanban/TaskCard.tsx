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
    <div className="bg-white p-5 rounded-[20px] shadow-horizon border border-transparent hover:border-brand-200 transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex justify-between items-start mb-3">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
          task.priority === 'urgent' ? "bg-red-50 text-red-500" :
          task.priority === 'high' ? "bg-amber-50 text-amber-500" :
          task.priority === 'medium' ? "bg-brand-50 text-brand-500" :
          "bg-secondary-gray-50 text-brand-300"
        )}>
          {task.priority}
        </span>
      </div>
      
      <h4 className="font-bold text-secondary-gray-600 text-[17px] mb-1 group-hover:text-brand-500 transition-colors leading-snug">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-sm font-medium text-brand-300 line-clamp-2 mb-4 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-brand-100">
        <div className="flex items-center gap-3">
          {task.dueDate && (
             <div className={cn("flex items-center gap-1.5 text-xs font-bold", isOverdue ? "text-red-500" : "text-brand-300")}>
               <Clock className="w-3.5 h-3.5" />
               <span>{format(new Date(task.dueDate), 'MMM d')}</span>
             </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-300">
             <MessageSquare className="w-3.5 h-3.5" />
             <span>0</span>
          </div>
        </div>
        
        <div className="flex -space-x-2">
           <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-500 flex items-center justify-center text-xs font-bold ring-2 ring-white overflow-hidden shadow-sm">
             {task.assignee.assigneeName.charAt(0)}
           </div>
           <div className="w-8 h-8 rounded-full bg-secondary-gray-100 text-brand-300 flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-sm">
             +1
           </div>
        </div>
      </div>
    </div>
  );
}
