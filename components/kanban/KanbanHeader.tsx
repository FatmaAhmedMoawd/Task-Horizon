'use client';
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { CreateTaskDrawer } from './CreateTaskDrawer';

export function KanbanHeader() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end mb-6 shrink-0">
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-horizon min-h-[44px] w-full sm:w-auto active:scale-95"
        >
          <Plus className="w-5 h-5 flex-shrink-0" />
          <span>New Task</span>
        </button>
      </div>

      <CreateTaskDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
