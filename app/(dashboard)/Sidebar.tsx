'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, KanbanSquare, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2 text-brand-600 font-display font-bold text-xl">
          <KanbanSquare className="h-6 w-6" />
          <span>Horizon</span>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <Link 
          href="/dashboard" 
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
            pathname === '/dashboard' ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
          )}
        >
          <LayoutDashboard className={cn("h-5 w-5", pathname === '/dashboard' ? "text-brand-600" : "text-slate-500")} />
          Dashboard
        </Link>
        <Link 
          href="/kanban" 
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
            pathname === '/kanban' ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
          )}
        >
          <KanbanSquare className={cn("h-5 w-5", pathname === '/kanban' ? "text-brand-600" : "text-slate-500")} />
          Kanban Board
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-200 shrink-0">
        <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors">
          <Settings className="h-5 w-5 text-slate-500" />
          Settings
        </button>
      </div>
    </aside>
  );
}
