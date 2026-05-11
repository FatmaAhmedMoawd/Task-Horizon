'use client';
import React, { useMemo } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { isPast, isToday } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { CheckCircle2, AlertCircle, Clock, ListTodo } from 'lucide-react';

export function DashboardContent() {
  const { tasks, taskIdsByStatus, hasHydratedFromStorage } = useAppSelector(state => state.kanban);

  const stats = useMemo(() => {
    const tasksList = Object.values(tasks);
    const total = tasksList.length;
    const completed = taskIdsByStatus.done.length;
    
    let overdueCount = 0;
    
    tasksList.forEach(task => {
      if (task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'done') {
        overdueCount++;
      }
    });

    return {
      total,
      completed,
      overdue: overdueCount,
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [tasks, taskIdsByStatus]);

  const workloadData = useMemo(() => {
    const assignees: Record<string, number> = {};
    Object.values(tasks).forEach(task => {
      const name = task.assignee.assigneeName;
      if (task.status !== 'done') {
        assignees[name] = (assignees[name] || 0) + 1;
      }
    });
    return Object.entries(assignees).map(([name, count]) => ({ name, count }));
  }, [tasks]);

  const priorityData = useMemo(() => {
    const priorities: Record<string, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
    Object.values(tasks).forEach(task => {
       priorities[task.priority]++;
    });
    return [
      { name: 'Low', value: priorities.low, color: '#94a3b8' },
      { name: 'Medium', value: priorities.medium, color: '#10b981' },
      { name: 'High', value: priorities.high, color: '#f59e0b' },
      { name: 'Urgent', value: priorities.urgent, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [tasks]);


  if (!hasHydratedFromStorage) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
           <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse border border-slate-200" />
        ))}
        <div className="md:col-span-2 lg:col-span-4 h-96 bg-slate-100 rounded-xl animate-pulse border border-slate-200 mt-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900 mb-1">Analytics Overview</h1>
        <p className="text-slate-500 text-sm">Key performance metrics and team workload.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Tasks</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.total}</h3>
          </div>
          <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
            <ListTodo className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Completed</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.completed}</h3>
            <p className="text-xs font-medium text-emerald-600 mt-1">{stats.completionRate}% completion rate</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Overdue</p>
            <h3 className="text-2xl font-bold text-slate-900">{stats.overdue}</h3>
            {stats.overdue > 0 && <p className="text-xs font-medium text-red-600 mt-1">Requires attention</p>}
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Avg. Time</p>
            <h3 className="text-2xl font-bold text-slate-900">2.4d</h3>
            <p className="text-xs font-medium text-emerald-600 mt-1">-0.5d from last week</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workload Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-base font-semibold text-slate-900 mb-6">Active Workload by Assignee</h3>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                 <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <h3 className="text-base font-semibold text-slate-900 mb-6">Tasks by Priority</h3>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={priorityData}
                   cx="50%"
                   cy="50%"
                   innerRadius={80}
                   outerRadius={110}
                   paddingAngle={2}
                   dataKey="value"
                 >
                   {priorityData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Legend verticalAlign="bottom" height={36} iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
