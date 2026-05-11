'use client';
import React, { useMemo } from 'react';
import { useAppSelector } from '@/lib/store/hooks';
import { isPast, isToday } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
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
      { name: 'Low', value: priorities.low, color: '#A3AED0' },
      { name: 'Medium', value: priorities.medium, color: '#422AFB' },
      { name: 'High', value: priorities.high, color: '#FFB800' },
      { name: 'Urgent', value: priorities.urgent, color: '#EE5D50' },
    ].filter(d => d.value > 0);
  }, [tasks]);


  if (!hasHydratedFromStorage) {
    return (
      <div className="space-y-8 max-w-[1600px] mx-auto pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => (
             <div key={i} className="h-24 bg-white rounded-[20px] animate-pulse shadow-horizon" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-[400px] bg-white rounded-[20px] animate-pulse shadow-horizon" />
          <div className="h-[400px] bg-white rounded-[20px] animate-pulse shadow-horizon" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-[20px] shadow-horizon flex items-center gap-4">
          <div className="p-4 bg-brand-50 text-brand-500 rounded-full">
            <ListTodo className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-300">Total Tasks</p>
            <h3 className="text-2xl font-bold text-secondary-gray-600 leading-tight">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] shadow-horizon flex items-center gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-500 rounded-full">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-300">Completed</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-secondary-gray-600 leading-tight">{stats.completed}</h3>
              <span className="text-xs font-bold text-emerald-500">+{stats.completionRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] shadow-horizon flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-500 rounded-full">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-300">Overdue</p>
            <h3 className="text-2xl font-bold text-secondary-gray-600 leading-tight">{stats.overdue}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[20px] shadow-horizon flex items-center gap-4">
          <div className="p-4 bg-[#FFF9E9] text-[#FFB800] rounded-full">
            <Clock className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-300">Avg. Time</p>
            <h3 className="text-2xl font-bold text-secondary-gray-600 leading-tight">2.4 days</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Workload Bar Chart */}
        <div className="bg-white p-8 rounded-[20px] shadow-horizon">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-bold text-secondary-gray-600">Team Workload</h3>
             <button className="p-2 bg-brand-50 text-brand-500 rounded-lg hover:bg-brand-100 transition-colors">
               <BarChart className="h-5 w-5" />
             </button>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9EDF7" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 500 }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12, fontWeight: 500 }} />
                 <Tooltip 
                   cursor={{ fill: '#F4F7FE' }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)' }}
                 />
                 <Bar dataKey="count" fill="#422AFB" radius={[8, 8, 0, 0]} maxBarSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="bg-white p-8 rounded-[20px] shadow-horizon">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-bold text-secondary-gray-600">Task Priorities</h3>
             <div className="px-3 py-1 bg-brand-50 text-brand-500 rounded-full text-xs font-bold uppercase tracking-wider">
               Real-time
             </div>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={priorityData}
                   cx="50%"
                   cy="50%"
                   innerRadius={80}
                   outerRadius={110}
                   paddingAngle={4}
                   dataKey="value"
                 >
                   {priorityData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                   ))}
                 </Pie>
                 <Tooltip 
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '14px 17px 40px 4px rgba(112, 144, 176, 0.08)' }}
                 />
                 <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#A3AED0' }} />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
