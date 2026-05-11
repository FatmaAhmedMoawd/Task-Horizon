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
    <div className="flex flex-col w-[85vw] sm:w-[350px] shrink-0 h-full max-h-full overflow-hidden snap-center">
      <div className="px-5 py-6 flex items-center justify-between pb-3">
        <h3 className="text-xl font-bold text-secondary-gray-600">{title}</h3>
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-white text-secondary-gray-600 text-sm font-bold shadow-horizon ring-1 ring-brand-100">
          {items.length}
        </span>
      </div>
      
      <div 
        ref={setNodeRef}
        className="flex-1 p-5 overflow-y-auto flex flex-col gap-5 min-h-0 custom-scrollbar hover:bg-brand-50/30 transition-colors rounded-[24px]"
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
