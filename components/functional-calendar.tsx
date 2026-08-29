'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CircleCheck, ListTodo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTodos } from '@/lib/todo-store'
import { useTasks } from '@/lib/task-store'

function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function sameDay(a: Date, b: Date) { return dateKey(a) === dateKey(b) }

// Safely parse due dates so they don't jump to the previous day based on timezones
function isTodoOnDate(dueStr: string, targetDate: Date) {
  if (!dueStr || dueStr === 'No date') return false
  if (dueStr.includes('-')) {
    const parts = dueStr.split('T')[0].split('-')
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      return sameDay(d, targetDate)
    }
  }
  const parsed = new Date(dueStr)
  return !Number.isNaN(parsed.getTime()) && sameDay(parsed, targetDate)
}

export function FunctionalCalendar() {
  const todos = useTodos()
  const tasks = useTasks()
  const [month, setMonth] = useState(() => new Date())
  const [selected, setSelected] = useState(() => new Date())
  const today = new Date()
  
  const cells = useMemo(() => { 
    const first = new Date(month.getFullYear(), month.getMonth(), 1); 
    const start = new Date(first); 
    start.setDate(1 - first.getDay()); 
    return Array.from({ length: 42 }, (_, index) => { 
      const date = new Date(start); 
      date.setDate(start.getDate() + index); 
      return date 
    }) 
  }, [month])
  
  // 1. Get To-Dos for the selected day
  const events = todos.filter((todo) => isTodoOnDate(todo.due, selected))
  
  // 2. Get Tasks for the selected day (Checking Daily or specific Weekly days)
  const selectedDayStr = selected.toLocaleDateString('en-US', { weekday: 'short' })
  const tasksForDay = tasks.filter((task) => {
    if (task.cadence === 'Daily') return true
    if (task.cadence === 'Weekly' && Array.isArray(task.days)) {
      return task.days.includes(selectedDayStr)
    }
    return false
  })
  
  const goMonth = (amount: number) => setMonth((value) => new Date(value.getFullYear(), value.getMonth() + amount, 1))
  const goToday = () => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(today) }
  const monthYearLabel = month.toLocaleDateString([], { month: 'long', year: 'numeric' })
  
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Progress history</p>
            <span className="inline-flex items-center rounded-md border border-amber-400 bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-950 shadow-sm">Beta</span>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-semibold tracking-tight">Calendar &amp; History</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" aria-label="Previous month" onClick={() => goMonth(-1)}><ChevronLeft /></Button>
          <span className="min-w-36 text-center text-sm font-medium">{monthYearLabel}</span>
          <Button variant="outline" size="icon" aria-label="Next month" onClick={() => goMonth(1)}><ChevronRight /></Button>
          <Button variant="outline" onClick={goToday}>Today</Button>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="rounded-2xl border border-border bg-card/40 p-4 backdrop-blur-xl sm:p-6">
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
            {['SUN','MON','TUE','WED','THU','FRI','SAT'].map((day) => <div key={day} className="pb-2">{day}</div>)}
            {cells.map((date) => { 
              const inMonth = date.getMonth() === month.getMonth(); 
              
              // Logic for showing indicator dots on calendar days
              const dateDayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
              const hasTodo = todos.some((todo) => isTodoOnDate(todo.due, date)); 
              const hasTask = tasks.some(task => 
                task.cadence === 'Daily' || 
                (task.cadence === 'Weekly' && Array.isArray(task.days) && task.days.includes(dateDayStr))
              ); 
              
              return (
                <button 
                  key={dateKey(date)} 
                  onClick={() => setSelected(date)} 
                  className={cn('relative flex aspect-square flex-col items-center justify-center rounded-lg border border-border/40 text-sm hover:border-foreground/50', !inMonth && 'opacity-30', sameDay(date, selected) && 'border-foreground ring-1 ring-foreground/30', sameDay(date, today) && 'bg-accent')}
                >
                  {date.getDate()}
                  <span className="mt-1 flex gap-1">
                    {hasTodo && <span className="size-1.5 rounded-full bg-yellow-400" />}
                    {hasTask && <span className="size-1.5 rounded-full bg-sky-400" />}
                  </span>
                </button> 
              )
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span><i className="mr-1 inline-block size-2 rounded-full bg-amber-400" />To-Dos</span>
            <span><i className="mr-1 inline-block size-2 rounded-full bg-sky-400" />Scheduled Tasks</span>
          </div>
        </section>
        <aside className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-xl">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Selected day</p>
          <h3 className="mt-2 text-lg font-semibold">{selected.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</h3>
          <div className="mt-6 flex flex-col gap-3">
            {events.map((todo) => (
              <div key={todo.id} className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3">
                <ListTodo className="mt-0.5 size-4 text-amber-400" />
                <div>
                  <p className="text-sm font-medium">{todo.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">To-Do · {todo.priority}</p>
                </div>
              </div>
            ))}
            {tasksForDay.map((task) => (
              <div key={task.id} className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3">
                <CircleCheck className="mt-0.5 size-4 text-sky-400" />
                <div>
                  <p className="text-sm font-medium">{task.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Task · {task.program} · {task.cadence}</p>
                </div>
              </div>
            ))}
            {!events.length && !tasksForDay.length && <p className="text-sm text-muted-foreground">Nothing scheduled for this day.</p>}
          </div>
        </aside>
      </div>
    </main>
  )
}

export default FunctionalCalendar