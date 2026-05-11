'use client';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { CreateTaskDrawer } from './CreateTaskDrawer';

export function KanbanHeader() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 mb-1">Kanban Board</h1>
          <p className="text-slate-500 text-sm sm:text-base">Manage your tasks and track progress.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm min-h-[44px] w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          <span>New Task</span>
        </button>
      </div>

      <CreateTaskDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
