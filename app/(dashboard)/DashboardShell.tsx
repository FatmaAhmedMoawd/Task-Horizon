'use client';
import React, { useState } from 'react';
import { Bell, Search, UserCircle, Menu, X, KanbanSquare, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import DataHydrator from './DataHydrator';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <DataHydrator>
      <div className="flex h-[100dvh] bg-slate-50 overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={closeMenu}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64",
          isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2 text-brand-600 font-display font-bold text-xl">
              <KanbanSquare className="h-6 w-6" />
              <span>Horizon</span>
            </div>
            <button 
              className="lg:hidden p-2 -mr-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <Link 
              href="/dashboard" 
              onClick={closeMenu}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors min-h-[48px]",
                pathname === '/dashboard' ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <LayoutDashboard className={cn("h-5 w-5", pathname === '/dashboard' ? "text-brand-600" : "text-slate-500")} />
              Dashboard
            </Link>
            <Link 
              href="/kanban" 
              onClick={closeMenu}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors min-h-[48px]",
                pathname === '/kanban' ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <KanbanSquare className={cn("h-5 w-5", pathname === '/kanban' ? "text-brand-600" : "text-slate-500")} />
              Kanban Board
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-200 shrink-0">
            <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-700 hover:bg-slate-100 font-medium transition-colors min-h-[48px]">
              <Settings className="h-5 w-5 text-slate-500" />
              Settings
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden min-w-0">
          {/* Header */}
          <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 w-full gap-4">
            <div className="flex items-center flex-1 gap-2 sm:gap-4">
              <button 
                className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex flex-shrink-0 items-center justify-center min-h-[44px] min-w-[44px]"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Optional Search */}
              <div className="relative flex-1 max-w-md hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search globally..."
                  className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-500 text-base rounded-full pl-10 pr-4 py-2.5 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                />
              </div>
              <button
                 className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
                 aria-label="Search mobile"
              >
                 <Search className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button className="relative w-11 h-11 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-colors min-h-[44px] min-w-[44px]">
                <Bell className="h-6 w-6" />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="flex items-center justify-center min-h-[44px] min-w-[44px] hover:opacity-80 transition-opacity">
                <UserCircle className="h-9 w-9 text-slate-400" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
             <div className="max-w-[1600px] mx-auto h-full w-full">
               {children}
             </div>
          </main>
        </div>
      </div>
    </DataHydrator>
  );
}
