import { Bell, Search, UserCircle } from 'lucide-react';
import DataHydrator from './DataHydrator';
import { Sidebar } from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DataHydrator>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 w-full">
            <div className="flex items-center flex-1">
              {/* Optional Search */}
              <div className="relative w-96 hidden lg:block">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search globally..."
                  className="w-full bg-slate-100 text-slate-900 placeholder:text-slate-500 text-sm rounded-full pl-9 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <UserCircle className="h-8 w-8 text-slate-400" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6 md:p-8 relative">
             <div className="max-w-[1600px] mx-auto h-full w-full">
               {children}
             </div>
          </main>
        </div>
      </div>
    </DataHydrator>
  );
}
