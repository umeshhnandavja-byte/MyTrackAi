'use client'

import { useMemo, useState } from 'react'
import { Check, Search, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { removeTask, setTaskCompleted, useTasks } from '@/lib/task-store'
import { AddTaskDialog } from '@/components/add-task-dialog'

export function TasksView() {
  const items = useTasks()
  const [filter, setFilter] = useState('All tasks')
  const [query, setQuery] = useState('')
  const programs = ['All tasks', ...Array.from(new Set(items.map((task) => task.program)))]
  const visible = useMemo(() => items.filter((task) => task && typeof task.name === 'string' && (filter === 'All tasks' || task.program === filter) && task.name.toLowerCase().includes(query.toLowerCase())), [items, filter, query])

  return <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Recurring programs</p><h2 className="text-3xl font-semibold tracking-tight">Tasks</h2><p className="mt-2 text-sm text-muted-foreground">Manage every task in your programs and keep your journey moving.</p></div><div className="flex items-center gap-2 rounded-xl border border-border bg-card/50 px-3 py-2 text-sm text-muted-foreground"><Check className="size-4" />{items.filter((task) => task.completed).length} completed</div></div><div className="grid gap-8 lg:grid-cols-[12rem_1fr]"><nav className="flex gap-1 overflow-auto lg:flex-col" aria-label="Task programs">{programs.map((program) => <button type="button" key={program} onClick={() => setFilter(program)} className={cn('whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground', filter === program && 'bg-accent text-foreground')}>{program}</button>)}</nav><section><div className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 backdrop-blur-xl"><Search className="size-4 text-muted-foreground" /><input aria-label="Search tasks" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search program tasks..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></div><div className="mb-4 flex justify-end"><AddTaskDialog /></div><div className="flex flex-col gap-2">{visible.map((task) => <div key={task.id} className={cn('flex items-center gap-4 rounded-xl border border-border/70 bg-card/40 px-4 py-4 transition-colors hover:bg-card/80', task.completed && 'opacity-50')}><button type="button" aria-label={`${task.completed ? 'Uncomplete' : 'Complete'} ${task.name}`} onClick={() => setTaskCompleted(task.id, !task.completed)} className={cn('flex size-5 shrink-0 items-center justify-center rounded-md border', task.completed ? 'border-foreground bg-foreground text-background' : 'border-muted-foreground/50')}>{task.completed && <Check className="size-3" />}</button><div className="min-w-0 flex-1"><p className={cn('font-medium', task.completed && 'line-through')}>{task.name}</p><p className="mt-1 text-sm text-muted-foreground">{task.program} · {task.cadence}</p></div><button type="button" aria-label={`Delete ${task.name}`} onClick={() => removeTask(task.id)} className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button></div>)}</div></section></div></main>
}

export const TasksPage = TasksView
