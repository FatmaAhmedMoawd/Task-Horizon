'use client';
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTaskCard } from './SortableTaskCard';
import { Status, Task } from '@/lib/types';

interface KanbanColumnProps {
  id: Status;
  title: string;
  items: string[];
  tasks: Record<string, Task>;
}

export function KanbanColumn({ id, title, items, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="flex flex-col w-[320px] shrink-0 bg-slate-100 rounded-xl max-h-full border border-slate-200">
      <div className="p-4 flex items-center justify-between border-b border-slate-200">
        <h3 className="font-semibold text-slate-700">{title}</h3>
        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-medium">
          {items.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 min-h-[150px]"
      >
        <SortableContext id={id} items={items} strategy={verticalListSortingStrategy}>
          {items.map(taskId => (
            <SortableTaskCard key={taskId} task={tasks[taskId]} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
