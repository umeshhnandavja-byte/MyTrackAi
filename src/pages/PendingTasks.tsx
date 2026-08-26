import React, { useState } from 'react';
import { useStore, type Category } from '../store';
import { Plus, Check, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const CATEGORIES: Category[] = ['Coding', 'Health', 'Studies', 'Social', 'Body'];

export default function PendingTasks() {
  const { tasks, addTask, updateTask, deleteTask } = useStore();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Coding');
  const [description, setDescription] = useState('');

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Tasks added here go to the backlog by default unless completed today
    addTask({
      title,
      category,
      type: 'description', // Todo lists only create regular tasks now
      description,
      completed: false,
      date: todayStr
    });
    
    setTitle('');
    setDescription('');
  };

  // Show all pending tasks that are NOT habits/streaks
  const pendingTasks = tasks.filter(t => !t.completed && t.type === 'description');
  const completedTasks = tasks.filter(t => t.completed && t.type === 'description');

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Todo List</h1>
        <p className="text-gray-400">Your one-off tasks and backlog.</p>
      </header>

      <section className="bg-surface p-6 rounded-2xl border border-gray-800">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Add a task to the backlog..."
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
              <Plus size={18} /> Add
            </button>
          </div>
          
          <input
            type="text"
            placeholder="Add extra description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-background border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Pending</h2>
        <div className="space-y-3">
          {pendingTasks.length === 0 && (
            <p className="text-gray-500 text-center py-8">No pending tasks! You're all caught up.</p>
          )}
          {pendingTasks.map(task => (
            <div key={task.id} className="bg-surface border border-gray-800 p-4 rounded-xl flex items-center gap-4 group">
              <button
                onClick={() => updateTask(task.id, { completed: true, date: todayStr })}
                className="w-6 h-6 rounded-md border-2 border-gray-600 hover:border-primary flex items-center justify-center transition-colors shrink-0"
              >
                <Check size={14} className="opacity-0 group-hover:opacity-100 text-primary" />
              </button>
              
              <div className="flex-1 min-w-0 flex flex-col gap-1">
                <h3 className="text-white font-medium truncate">{task.title}</h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 whitespace-nowrap">
                    {task.category}
                  </span>
                  {task.date !== todayStr && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 flex items-center gap-1">
                      <Calendar size={10} /> {task.date}
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-gray-400 mt-1 truncate">{task.description}</p>
                )}
              </div>
              
              <button
                onClick={() => deleteTask(task.id)}
                className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 shrink-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {completedTasks.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4 opacity-50">Completed</h2>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} className="bg-surface/50 border border-gray-800/50 p-4 rounded-xl flex items-center gap-4 group">
                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center shrink-0">
                  <Check size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-1 opacity-50">
                  <h3 className="text-white font-medium truncate line-through">{task.title}</h3>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-2 shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
