import React, { useState, useEffect } from 'react';
import { ActivityCalendar } from 'react-activity-calendar';
import { useStore, type Category } from '../store';
import { getDatesWithActivity, calculateStreaks, generateCalendarData } from '../utils/streaks';
import { format } from 'date-fns';
import { Plus, Check, Trash2, Trash } from 'lucide-react';

const CATEGORIES: Category[] = ['Coding', 'Health', 'Studies', 'Social', 'Body'];

export default function Dashboard() {
  const { tasks, addTask, updateTask, deleteTask, githubUsername, syncGithubActivity } = useStore();

  useEffect(() => {
    syncGithubActivity();
  }, [syncGithubActivity]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Single Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Coding');
  
  // Delete Mode State
  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Dashboard only creates 'streak' tasks now.
    addTask({
      title,
      category,
      type: 'streak',
      completed: false,
      date: todayStr
    });
    
    setTitle('');
  };

  // Group by unique task title (only for streak tasks)
  const streakTasks = tasks.filter(t => t.type === 'streak');
  const uniqueTitles = Array.from(new Set(streakTasks.map(t => t.title)));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Habits & Streaks</h1>
          <p className="text-gray-400">Track your daily recurring habits.</p>
        </div>
        <button
          onClick={() => setIsDeleteMode(!isDeleteMode)}
          className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors border ${
            isDeleteMode 
              ? 'bg-red-500/10 border-red-500/50 text-red-400' 
              : 'bg-surface border-gray-700 text-gray-300 hover:text-white'
          }`}
        >
          <Trash size={18} />
          {isDeleteMode ? 'Done Deleting' : 'Edit Habits'}
        </button>
      </header>

      {/* --- HABIT ADDER --- */}
      <section className="bg-surface p-6 rounded-2xl border border-gray-800">
        <form onSubmit={handleAdd} className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Add a new daily habit..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 min-w-[200px] bg-background border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="bg-background border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus size={18} /> Add Habit
          </button>
        </form>
      </section>

      <div className="space-y-6">
        {uniqueTitles.map((taskTitle) => {
          const titleTasks = streakTasks.filter(t => t.title === taskTitle);
          if (titleTasks.length === 0) return null;
          
          const primaryCategory = titleTasks[titleTasks.length - 1].category;
          const uniqueDates = getDatesWithActivity(titleTasks);
          const { current, longest } = calculateStreaks(uniqueDates);
          const calendarData = generateCalendarData(titleTasks);
          
          let themeColor = '#10b981';
          if (primaryCategory === 'Coding') themeColor = '#8b5cf6';
          if (primaryCategory === 'Health') themeColor = '#ef4444';
          if (primaryCategory === 'Studies') themeColor = '#3b82f6';
          if (primaryCategory === 'Social') themeColor = '#f59e0b';
          if (primaryCategory === 'Body') themeColor = '#ec4899';

          const todaysTask = titleTasks.find(t => t.date === todayStr);
          const isCompletedToday = todaysTask?.completed || false;

          const handleToggleToday = () => {
            if (todaysTask) {
              updateTask(todaysTask.id, { completed: !todaysTask.completed });
            } else {
              // Create it and immediately complete it
              addTask({
                title: taskTitle,
                category: primaryCategory,
                type: 'streak',
                description: '',
                completed: true,
                date: todayStr
              });
            }
          };

          const handleMasterDelete = () => {
            // Delete all tasks associated with this streak
            titleTasks.forEach(t => deleteTask(t.id));
          };

          return (
            <section key={taskTitle} className="bg-surface rounded-2xl border border-gray-800 p-6 flex flex-col xl:flex-row gap-8 items-center group">
              
              {/* Left Side: Header & Checkbox */}
              <div className="flex flex-col xl:w-1/3 w-full">
                <div className="flex items-start gap-4" style={{ '--theme-color': themeColor } as React.CSSProperties}>
                  <button
                    onClick={handleToggleToday}
                    className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 mt-1 ${
                      isCompletedToday 
                        ? 'bg-[var(--theme-color)] border-[var(--theme-color)]' 
                        : 'border-gray-600 hover:border-[var(--theme-color)]'
                    }`}
                  >
                    <Check size={18} className={isCompletedToday ? 'text-white' : 'opacity-0'} />
                  </button>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{taskTitle}</h3>
                    <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-gray-800 text-gray-400">
                      {primaryCategory}
                    </span>
                  </div>

                  {isDeleteMode && (
                    <button 
                      onClick={handleMasterDelete} 
                      className="text-red-400 hover:text-red-300 p-2 shrink-0 animate-in zoom-in duration-200 bg-red-500/10 rounded-lg"
                      title="Delete this entire habit"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Right Side: Streaks & Graph */}
              <div className="flex-1 flex flex-col justify-center w-full">
                <div className="flex items-center justify-between mb-4 px-4">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      Current: <strong style={{ color: themeColor }} className="text-lg">{current} days</strong>
                    </span>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-400">
                      Best: <strong className="text-white text-lg">{longest} days</strong>
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-center xl:justify-end overflow-x-auto">
                  <ActivityCalendar
                    data={calendarData}
                    theme={{
                      light: ['#2e303a', `${themeColor}40`, `${themeColor}80`, `${themeColor}c0`, themeColor],
                      dark: ['#2e303a', `${themeColor}40`, `${themeColor}80`, `${themeColor}c0`, themeColor],
                    }}
                    colorScheme="dark"
                    labels={{
                      totalCount: `{{count}} completions in the last year`,
                    }}
                  />
                </div>
              </div>

            </section>
          );
        })}
      </div>
      
      {githubUsername && (
        <section className="bg-surface p-6 rounded-2xl border border-gray-800">
          <h2 className="text-xl font-semibold text-white mb-4">GitHub Activity</h2>
          <div className="flex justify-center">
            <p className="text-gray-400 text-sm">
              Linked to GitHub account: <span className="text-primary font-medium">{githubUsername}</span>. 
              (Integration coming soon)
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
