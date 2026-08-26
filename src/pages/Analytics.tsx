import React, { useMemo } from 'react';
import { useStore, type Category } from '../store';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area
} from 'recharts';
import { subDays, format } from 'date-fns';

export default function Analytics() {
  const { tasks } = useStore();

  const { radarData, barData, timelineData } = useMemo(() => {
    const categories: Category[] = ['Coding', 'Health', 'Studies', 'Social', 'Body'];
    
    // Category Counts
    const counts = categories.reduce((acc, cat) => {
      acc[cat] = tasks.filter(t => t.completed && t.category === cat).length;
      return acc;
    }, {} as Record<Category, number>);

    const maxVal = Math.max(...Object.values(counts), 10);

    const radarData = categories.map(cat => ({
      subject: cat,
      A: counts[cat],
      fullMark: maxVal,
    }));

    const barData = categories.map(cat => ({
      name: cat,
      completed: counts[cat],
      fill: cat === 'Coding' ? '#8b5cf6' : 
            cat === 'Health' ? '#ef4444' : 
            cat === 'Studies' ? '#3b82f6' : 
            cat === 'Social' ? '#f59e0b' : '#ec4899'
    }));

    // 14-day Timeline
    const today = new Date();
    const timelineData = Array.from({ length: 14 }).map((_, i) => {
      const d = subDays(today, 13 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      
      const count = tasks.filter(t => t.completed && t.date === dateStr).length;
      
      return {
        date: format(d, 'MMM dd'),
        completed: count
      };
    });

    return { radarData, barData, timelineData };
  }, [tasks]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-gray-400">Deep dive into your productivity and habits.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- SKILL TREE (RADAR) --- */}
        <section className="bg-surface p-6 rounded-2xl border border-gray-800 h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-4">Skill Tree</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                <Radar
                  name="Stats"
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.5}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e1e24', borderColor: '#374151', color: '#fff' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* --- CATEGORY BREAKDOWN (BAR) --- */}
        <section className="bg-surface p-6 rounded-2xl border border-gray-800 h-[400px] flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-4">Category Breakdown</h2>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#2e303a' }}
                  contentStyle={{ backgroundColor: '#1e1e24', borderColor: '#374151', color: '#fff' }}
                />
                <Bar dataKey="completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

      </div>

      {/* --- 14-DAY TIMELINE (AREA) --- */}
      <section className="bg-surface p-6 rounded-2xl border border-gray-800 h-[400px] flex flex-col">
        <h2 className="text-xl font-semibold text-white mb-4">14-Day Activity Velocity</h2>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e24', borderColor: '#374151', color: '#fff' }}
                itemStyle={{ color: '#10b981' }}
              />
              <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

    </div>
  );
}
