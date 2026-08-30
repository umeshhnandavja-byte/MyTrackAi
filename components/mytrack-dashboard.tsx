'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useCategories, loadCategories} from '@/lib/category-store'
import { useProfile, loadProfile } from '@/lib/profile-store'
import { useMapProgressDelayDays } from '@/lib/map-settings-store'
import { useTasks, setTaskCompleted, loadTasks, runAutoSync } from '@/lib/task-store'
import { setTodoDone, useTodos, loadTodos } from '@/lib/todo-store'
import { AddTaskDialog } from '@/components/add-task-dialog'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UpcomingContests } from '@/components/upcoming-contests'
import { PlanningBoard } from '@/components/detective-board'
import { TodoView } from '@/components/productivity-views'
import FunctionalCalendar from '@/components/functional-calendar'
import { CommandCenter } from '@/components/command-center'
import { CustomTimer } from '@/components/custom-timer'
import { TasksView } from '@/components/tasks-view'
import { AnalyticsView, PlatformTrends } from '@/components/analytics-view'
import { SettingsPanels } from '@/components/settings-panels'
import { CalendarDays, Check, ChevronRight, Circle, ClipboardList, Command, LayoutDashboard, Map, Menu, Settings, Sparkles, Target, Terminal, Timer, Brain, Dumbbell, Inbox, Heart, Repeat2, BarChart3, PanelLeftClose, PanelLeftOpen, ListChecks} from 'lucide-react'
import { SignInDialog } from '@/components/sign-in-dialog'
import { SignUpDialog } from '@/components/sign-up-dialog'
import { loadBoard } from '@/lib/board-store'
import { useGlobalTimer } from '@/lib/timer-store'
import { TimerBadge } from '@/components/timer-badge'
import { Logo } from './logo'
import { AboutView } from './about'
import { TermsView } from './terms'

const nav = [[LayoutDashboard, 'Dashboard'], [ListChecks, 'Tasks'], [Inbox, 'To-Do'], [Map, 'Planning Board'], [BarChart3, 'Analysis'], [CalendarDays, 'Calendar'], [Settings, 'Settings'], [Sparkles, 'About'], [ClipboardList, 'Terms']] as const
const taskIcons = [Dumbbell, Brain, Terminal, Target, Terminal, Brain]
const categoryIcons = { heart: Heart, repeat: Repeat2, code: Terminal, brain: Brain, target: Target, dumbbell: Dumbbell }

function TodoPreview({ onOpen }: { onOpen: () => void }) {
  const todos = useTodos()
  return <><section className="rounded-2xl border border-border/70 bg-card/40 p-5 backdrop-blur-xl"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><ListChecks className="size-4" /><h3 className="font-semibold">To-Do List</h3></div><button onClick={onOpen} className="text-sm font-medium hover:underline">View all</button></div><div className="mt-4 flex flex-col gap-2">{todos.map((todo) => <div key={todo.id} className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/30 px-3 py-2.5 text-sm"><button type="button" aria-label={`${todo.done ? 'Uncheck' : 'Complete'} ${todo.title}`} onClick={() => setTodoDone(todo.id, !todo.done)} className={cn('flex size-4 shrink-0 items-center justify-center rounded border border-muted-foreground/50', todo.done && 'border-foreground bg-foreground text-background')}>{todo.done && <Check className="size-3" />}</button><span className={cn('truncate', todo.done && 'line-through text-muted-foreground')}>{todo.title}</span></div>)}</div></section><section className="mt-4 rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur-xl"><div className="flex items-start gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30"><Terminal className="size-4" /></div><div onClick={() => { window.location.href = 'https://code-sync-seven-liard.vercel.app/' }}><p className="text-sm font-semibold">CodeSync</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Manage your DSA problems and journey using CodeSync.</p></div></div></section></>
}

function DashboardMap() {
  const categories = useCategories()
  const tasks = useTasks()
  const mapDelayDays = useMapProgressDelayDays()
  
  // Dynamically calculate category values based on completed tasks in that category
  const categoryCount = categories.length
  const mapPositions = categories.map((_, index) => { const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(categoryCount, 1); return { x: `${50 + Math.cos(angle) * 34}%`, y: `${50 + Math.sin(angle) * 34}%` } })
  const mapPoints = categories.map((_, index) => { const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(categoryCount, 1); return `${60 + Math.cos(angle) * 49},${60 + Math.sin(angle) * 49}` }).join(' ')
  const mapSpokes = categories.map((_, index) => { const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(categoryCount, 1); return `M60 60L${60 + Math.cos(angle) * 49} ${60 + Math.sin(angle) * 49}` }).join(' ')
  
  // Calculate score/value dynamically from completed tasks belonging to this category program
  const nodes = categories.map((category, index) => {
    const completedTasksCount = tasks.filter(t => t.program === category.name && t.completed).length
    const totalValue = mapDelayDays > 0 ? 0 : (category.value + completedTasksCount * 10) // 10 XP per completed task!
    return { ...category, value: totalValue, ...mapPositions[index] }
  })

  return (
    <div className="relative aspect-square w-full max-w-none overflow-hidden rounded-2xl border border-border/70 bg-background/30 p-4 backdrop-blur-2xl" aria-label="Dashboard analytics map">
      <div className="absolute left-4 top-4 z-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Performance map</p>
        <p className="mt-1 text-[11px] text-muted-foreground">Current category balance</p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="size-[62%]" aria-hidden="true">
          <polygon points={mapPoints} fill="none" stroke="currentColor" strokeWidth="1.2" className="text-foreground/50" />
          <polygon points={categories.map((_, index) => { const angle = -Math.PI / 2 + (index * Math.PI * 2) / Math.max(categoryCount, 1); return `${60 + Math.cos(angle) * 25},${60 + Math.sin(angle) * 25}` }).join(' ')} fill="none" stroke="currentColor" strokeDasharray="3 4" strokeWidth="1" className="text-muted-foreground/40" />
          <path d={mapSpokes} fill="none" stroke="currentColor" strokeWidth=".8" className="text-muted-foreground/35" />
          <circle cx="60" cy="60" r="5" fill="currentColor" className="text-foreground/80" />
        </svg>
      </div>
      <div className="absolute inset-0">
        {nodes.map((node, index) => { 
          const Icon = categoryIcons[node.image as keyof typeof categoryIcons] || Target; 
          return (
            <motion.div key={node.id} initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * .08 }} className="absolute flex w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-xl border border-border/80 bg-card/85 px-2 py-2 text-center shadow-lg backdrop-blur-xl sm:w-24" style={{ left: node.x, top: node.y }}>
              <div className="flex items-center gap-2">
                {node.imageUrl ? <img src={node.imageUrl} alt="" className="size-3.5 rounded object-cover" /> : <Icon className="size-3.5 text-foreground" />}
                <span className="block w-full truncate text-[10px] font-medium leading-tight sm:text-[11px]">{node.name}</span>
              </div>
              <p className="mt-1 text-[10px] leading-none text-muted-foreground">{node.value} XP</p>
            </motion.div>
          ) 
        })}
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Progress map</div>
    </div>
  )
}

export function MyTrackDashboard({ 
  isAuthenticated = false, 
  userName = 'Hacker' 
}: { 
  isAuthenticated?: boolean; 
  userName?: string 
}) {

  useGlobalTimer()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeView, setActiveView] = useState('Dashboard')
  const profile = useProfile()
  const sharedTasks = useTasks()
  const categories = useCategories()
  const tasks = sharedTasks.map((task, index) => { const category = categories.find((item) => item.name === task.program); return { ...task, meta: task.program, icon: categoryIcons[category?.image as keyof typeof categoryIcons] || taskIcons[index % taskIcons.length], imageUrl: category?.imageUrl } })

  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'short' })

  const tasksForToday = tasks.filter(task => {
    if (task.cadence === 'Weekly' && Array.isArray(task.days) && task.days.length > 0) {
      return task.days.includes(todayStr)
    }
    return true // Always show Daily, Monthly, or Yearly tasks
  })

  const userTasks = tasks.filter((task) => !/codesync|platform/i.test(`${task.name} ${task.program}`))

  const currentStreak = userTasks.length ? Math.max(...userTasks.map((task) => task.streak || 0)) : 0
  const maxStreak = userTasks.length ? Math.max(...userTasks.map((task) => task.streak || 0), currentStreak) : 0
  const [popup, setPopup] = useState<'profile' | 'timer' | 'ai' | null>(null)
  const [cursor, setCursor] = useState({ x: -400, y: -400 })
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => setCursor({ x: event.clientX, y: event.clientY })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [])
  
  useEffect(() => {
    const initApp = async () => {
      await loadProfile() // Load true user details
      await loadCategories()
      await loadTasks()
      await loadTodos()
      await loadBoard()
      
      // Check for GitHub/Leetcode updates in the background on refresh!
      runAutoSync()
    }

    initApp()
  }, [isAuthenticated])

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div aria-hidden="true" className="pointer-events-none fixed z-0 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl transition-[left,top] duration-500 ease-out" style={{ left: cursor.x, top: cursor.y, background: 'radial-gradient(circle, oklch(1 0 0 / 0.035) 0%, oklch(1 0 0 / 0.016) 18%, transparent 62%)' }} />
      <div className="relative z-10 min-h-screen">
        <aside className={cn('fixed inset-y-0 left-0 z-30 flex flex-col items-start border-r border-border/70 bg-sidebar/80 py-6 backdrop-blur-2xl transition-all lg:translate-x-0', sidebarCollapsed ? 'w-20 items-center px-2' : 'w-56 px-4', mobileOpen ? 'translate-x-0' : '-translate-x-full')}>
          <div className="mb-10 flex w-full items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-card/50 text-foreground"><Logo className="size-7" /></div>{!sidebarCollapsed && <div className="flex items-center gap-2"><span className="text-sm font-semibold tracking-tight">MyTrack</span></div>}<button className="ml-auto hidden size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground lg:flex" aria-label={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'} title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'} onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}>{sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}</button></div>
          <nav className="flex w-full flex-1 flex-col items-stretch gap-2" aria-label="Main navigation">{nav.map(([Icon, label], index) => <button key={label} title={label} aria-label={label} onClick={() => setActiveView(label)} className={cn('group relative flex h-11 w-full items-center justify-start gap-3 rounded-xl px-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground', activeView === label && 'bg-accent text-foreground')}><Icon className="size-5" /><span className={cn('text-sm transition-opacity', sidebarCollapsed && 'sr-only')}>{label}</span>{activeView === label && <span className="absolute -right-[21px] h-6 w-0.5 rounded-full bg-foreground" />}</button>)}</nav>
          <button aria-label={`Open profile for ${profile.name}`} title="Profile" onClick={() => setPopup('profile')} className="flex size-10 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground hover:bg-accent">{profile.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</button>
        </aside>
        <div className={cn('transition-[padding] duration-300', sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-56')}>
          
          <header className="flex h-20 items-center gap-4 border-b border-border/70 px-5 sm:px-8">
            <button className="lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(!mobileOpen)}><Menu className="size-5" /></button>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Tuesday, October 24, 2024</p>
              <h1 className="text-xl font-semibold tracking-tight">{greeting}, {isAuthenticated ? userName.split(' ')[0] : profile.name.split(' ')[0]}.</h1>
            </div>

            {/* NEW: Auth Buttons next to AI Bar */}
            {!isAuthenticated && (
              <div className="flex shrink-0 items-center gap-2">
                <SignInDialog />
                <SignUpDialog />
              </div>
            )}

            <div className="hidden w-full max-w-md items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-2.5 backdrop-blur-xl sm:flex">
              <button className="flex flex-1 items-center gap-3 text-left" onClick={() => setPopup('ai')}><Sparkles className="size-4 text-foreground" /><span className="text-sm text-muted-foreground">Ask AI to add a task...</span></button><kbd className="ml-auto rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">⌘ K</kbd>
            </div>

            <TimerBadge onClick={() => setPopup('timer')} />

            <button className="flex size-10 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-accent" aria-label="Timer" title="Focus timer" onClick={() => setPopup('timer')}><Timer className="size-4" /></button>
          </header>

          {activeView === 'Tasks' ? <TasksView /> : activeView === 'Planning Board' ? <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><PlanningBoard /></main> : activeView === 'To-Do' ? <TodoView /> : activeView === 'Calendar' ? <FunctionalCalendar /> : activeView === 'About' ? ( <AboutView /> ) : activeView === 'Terms' ? ( <TermsView /> ) : activeView === 'Settings' ? <SettingsPanels /> : activeView === 'Analysis' ? <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><AnalyticsView /></main> : <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><section className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Overview</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your dashboard</h2><p className="mt-2 text-sm text-muted-foreground">A clear view of what deserves your attention today.</p></div><div className="flex items-center gap-3 rounded-xl border border-border bg-card/50 px-4 py-3 backdrop-blur-xl"><div className="flex size-8 items-center justify-center rounded-lg border border-border"><FlameIcon /></div><div><p className="text-xs text-muted-foreground">Current streak</p><p className="text-sm font-semibold">{currentStreak} days</p><p className="text-xs text-muted-foreground">Max streak: {maxStreak} days</p></div></div></section>
          <section className="mb-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_28rem]"><section className="max-w-3xl"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-semibold tracking-tight">Today&apos;s Active Tasks</h2><p className="mt-1 text-sm text-muted-foreground">Keep the important things moving.</p></div><div className="flex items-center gap-3"><button onClick={() => setActiveView('Tasks')} className="flex items-center gap-1 text-sm font-medium hover:underline">View all <ChevronRight className="size-4" /></button><AddTaskDialog /></div></div>
          <AnimatePresence initial={false}>
              <div className="flex flex-col gap-2">
              {tasksForToday.filter((task) => !task.completed).length === 0 ? (
              <div className="flex items-center justify-center rounded-xl border border-dashed border-border/70 p-8 text-center">
              <p className="text-sm text-muted-foreground">You have no tasks scheduled for today. Enjoy your day!</p>
              </div>
              ) : (
              tasksForToday.filter((task) => !task.completed).map((task, index) => { 
              const Icon = task.icon; 
              return (
              <motion.div key={task.id} layout initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80, height: 0, marginBottom: -8, transition: { duration: 0.35, ease: 'easeInOut' } }} whileHover={{ x: 3 }} className={cn('flex items-center gap-4 rounded-xl border border-border/70 bg-card/45 px-4 py-3.5 backdrop-blur-xl transition-colors hover:bg-card/75', task.completed && 'opacity-60')}>
              <button aria-label={`Mark ${task.name} ${task.completed ? 'incomplete' : 'complete'}`} onClick={() => setTaskCompleted(task.id, !task.completed)} className={cn('flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors', task.completed ? 'border-foreground bg-foreground text-background' : 'border-muted-foreground/50 hover:border-foreground')}>
              {task.completed && <Check className="size-3.5" />}
              </button>
              <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/30 text-muted-foreground">
                {task.imageUrl ? <img src={task.imageUrl} alt="" className="size-4 rounded object-cover" /> : <Icon className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn('truncate text-sm font-medium', task.completed && 'line-through')}>{task.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{task.meta}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FlameIcon />{task.streak}
              </div>
                      <Circle className="size-4 text-muted-foreground/30" />
                      </motion.div>
                    )
                  })
                )}
                </div>
              </AnimatePresence>
<div className="mt-6"><TodoPreview onOpen={() => setActiveView('To-Do')} /></div></section><div className="flex flex-col gap-3"><DashboardMap/><UpcomingContests /></div>      </section>
          </main>}
        
        <Dialog open={popup !== null} onOpenChange={(open) => !open && setPopup(null)}><DialogContent className="border-border bg-card/90 backdrop-blur-2xl">
  <DialogHeader>
    <DialogTitle>{popup === 'profile' ? profile.name : popup === 'timer' ? 'Focus timer' : 'AI command center'}</DialogTitle>
    <DialogDescription>
      {popup === 'profile' ? `Active streak: ${currentStreak} days` : popup === 'timer' ? 'A quiet space for a focused work session.' : 'Describe a task and AI will prepare it for your review.'}
    </DialogDescription>
  </DialogHeader>
  <div className="rounded-xl border border-border bg-background/40 p-4 text-sm text-muted-foreground">
    {popup === 'profile' ? (
      <div className="space-y-1">
        <p className="font-medium text-foreground">{profile.name}</p>
        <p className="text-xs text-muted-foreground">{profile.email}</p>
      </div>
    ) : popup === 'timer' ? (
      <CustomTimer />
    ) : (
      <CommandCenter />
    )}
  </div>
</DialogContent></Dialog>
        </div>
      </div>
    </div>
  )
}
function FlameIcon() { return <span className="text-xs" aria-hidden="true">◈</span> }