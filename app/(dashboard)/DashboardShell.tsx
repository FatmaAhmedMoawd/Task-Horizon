'use client';
import React, { useState } from 'react';
import { Bell, Search, UserCircle, Menu, X, KanbanSquare, LayoutDashboard, Settings, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import DataHydrator from './DataHydrator';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsMobileMenuOpen(false);

  // Helper for breadcrumbs
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const name = path.charAt(0).toUpperCase() + path.slice(1);
      return { name, href: '/' + paths.slice(0, index + 1).join('/') };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <DataHydrator>
      <div className="flex h-[100dvh] bg-brand-50 overflow-hidden relative">
        
        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 z-40 bg-secondary-gray-700/30 backdrop-blur-sm lg:hidden transition-opacity"
            onClick={closeMenu}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col shrink-0 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-[290px] shadow-horizon lg:shadow-none",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-24 flex items-center justify-center px-8 shrink-0">
            <div className="flex items-center gap-3 text-secondary-gray-600 font-sans font-bold text-2xl tracking-tight uppercase">
              <span className="text-brand-500 font-black">Horizon</span> UI
            </div>
            <button 
              className="lg:hidden p-2 absolute right-4 text-slate-500 hover:bg-slate-100 rounded-full transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 mb-4">
            <div className="h-px bg-brand-100 w-full" />
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4">
            <div className="px-4 py-2">
              <span className="text-[11px] font-bold text-brand-300 uppercase tracking-widest">Main Menu</span>
            </div>
            
            <Link 
              href="/dashboard" 
              onClick={closeMenu}
              className={cn(
                "group flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all min-h-[52px]",
                pathname === '/dashboard' 
                  ? "text-secondary-gray-600" 
                  : "text-brand-300 hover:text-secondary-gray-500"
              )}
            >
              <div className="flex items-center gap-4">
                <LayoutDashboard className={cn("h-5 w-5 transition-colors", pathname === '/dashboard' ? "text-brand-500" : "text-brand-300 group-hover:text-secondary-gray-500")} />
                <span className="text-[15px]">Dashboard</span>
              </div>
              {pathname === '/dashboard' && <div className="w-1.5 h-8 bg-brand-500 rounded-full absolute right-0" />}
            </Link>

            <Link 
              href="/kanban" 
              onClick={closeMenu}
              className={cn(
                "group flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all min-h-[52px] relative",
                pathname === '/kanban' 
                  ? "text-secondary-gray-600" 
                  : "text-brand-300 hover:text-secondary-gray-500"
              )}
            >
              <div className="flex items-center gap-4">
                <KanbanSquare className={cn("h-5 w-5 transition-colors", pathname === '/kanban' ? "text-brand-500" : "text-brand-300 group-hover:text-secondary-gray-500")} />
                <span className="text-[15px]">Kanban Board</span>
              </div>
              {pathname === '/kanban' && <div className="w-1.5 h-8 bg-brand-500 rounded-full absolute right-0" />}
            </Link>

            <div className="px-4 py-4 mt-4">
              <span className="text-[11px] font-bold text-brand-300 uppercase tracking-widest">Support</span>
            </div>

            <button className="group flex items-center gap-4 px-4 py-3.5 w-full rounded-xl text-brand-300 hover:text-secondary-gray-500 font-bold transition-all min-h-[52px]">
              <Settings className="h-5 w-5 group-hover:text-secondary-gray-500" />
              <span className="text-[15px]">Settings</span>
            </button>
            <button className="group flex items-center gap-4 px-4 py-3.5 w-full rounded-xl text-brand-300 hover:text-secondary-gray-500 font-bold transition-all min-h-[52px]">
              <Info className="h-5 w-5 group-hover:text-secondary-gray-500" />
              <span className="text-[15px]">Help Center</span>
            </button>
          </nav>

          <div className="p-6">
            <div className="p-4 bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl text-white shadow-horizon">
              <div className="bg-white/20 w-8 h-8 rounded-full flex items-center justify-center mb-3">
                <LayoutDashboard className="h-4 w-4" />
              </div>
              <p className="font-bold text-sm mb-1">Upgrade to PRO</p>
              <p className="text-white/80 text-xs mb-3">Unlock all features and power-up your dashboard.</p>
              <button className="bg-white text-secondary-gray-600 w-full py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90 transition-all">
                Get Started
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden min-w-0 pr-4 sm:pr-6 lg:pr-8 pl-4 lg:pl-0">
          {/* Header / Navbar - Floating Style */}
          <header className="py-4 lg:py-6 sticky top-0 z-20">
            <div className="bg-white/40 backdrop-blur-xl border border-white/20 shadow-horizon rounded-3xl px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <nav className="flex items-center text-xs font-medium text-secondary-gray-400 mb-1 leading-none">
                  <Link href="/dashboard" className="hover:text-secondary-gray-600 transition-colors">Pages</Link>
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.href}>
                      <ChevronRight className="h-3 w-3 mx-1" />
                      <Link 
                        href={crumb.href} 
                        className={cn(
                          "transition-colors",
                          idx === breadcrumbs.length - 1 ? "text-secondary-gray-600 font-bold" : "hover:text-secondary-gray-600"
                        )}
                      >
                        {crumb.name}
                      </Link>
                    </React.Fragment>
                  ))}
                </nav>
                <h1 className="text-secondary-gray-600 font-bold text-2xl lg:text-3xl leading-tight truncate max-w-[200px] sm:max-w-md">
                   {breadcrumbs[breadcrumbs.length - 1]?.name || 'Main Dashboard'}
                </h1>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 shrink-0 bg-white shadow-horizon rounded-full p-2.5">
                <button 
                  className="lg:hidden p-2 text-secondary-gray-400 hover:bg-brand-50 rounded-full transition-colors flex flex-shrink-0 items-center justify-center h-10 w-10"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="bg-brand-50 text-secondary-gray-600 placeholder:text-brand-300 text-sm rounded-full pl-10 pr-4 py-2.5 h-10 w-44 lg:w-56 focus:outline-none transition-all border border-transparent focus:border-brand-200"
                  />
                </div>

                <button 
                  className="relative flex items-center justify-center text-secondary-gray-400 hover:bg-brand-50 rounded-full transition-colors h-10 w-10"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <button 
                   className="flex items-center justify-center text-secondary-gray-400 hover:bg-brand-50 rounded-full transition-colors h-10 w-10"
                   aria-label="Toggle Theme"
                >
                   <Info className="h-5 w-5" />
                </button>

                <button 
                  className="flex items-center justify-center h-10 w-10 hover:opacity-80 transition-opacity overflow-hidden rounded-full ring-2 ring-transparent hover:ring-brand-100"
                  aria-label="User profile"
                >
                  <div className="h-full w-full bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    JD
                  </div>
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto pb-8 relative pt-2">
             <div className="max-w-[1600px] mx-auto h-full w-full">
               {children}
             </div>
          </main>
        </div>
      </div>
    </DataHydrator>
  );
}
