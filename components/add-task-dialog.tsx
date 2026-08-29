'use client'

// Shared dashboard-style task creation dialog.
import { useState } from 'react'
import { Check, Code2, Flame, GitBranch, GitFork, Layers3, Target, Terminal, Zap } from 'lucide-react' // lucide icons
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { addTask } from '@/lib/task-store'

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const categories = [
  { name: 'Vitality Oasis', icon: Flame, hint: 'Health & wellbeing' },
  { name: 'The Outpost', icon: Check, hint: 'General tasks' },
  { name: 'Code Forge', icon: Terminal, hint: 'Software development' },
  { name: 'Algorithm Spire', icon: Code2, hint: 'Logic & problem solving' },
  { name: 'Strategy Sanctum', icon: Target, hint: 'Planning & focus' },
]

export function AddTaskDialog() {
  const [open, setOpen] = useState(false)
  const [frequency, setFrequency] = useState('daily')
  const [tracking, setTracking] = useState('manual')
  const [days, setDays] = useState(['M', 'W', 'F'])
  const [category, setCategory] = useState('The Outpost')
  const [title, setTitle] = useState('')
  const createTask = () => { if (!title.trim()) return; addTask({ name: title.trim(), program: category, cadence: frequency === 'weekly' ? 'Weekly' : 'Daily', streak: 0 }); setTitle(''); setOpen(false) }
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<Button className="rounded-xl px-4"><Zap data-icon="inline-start" /> Add task</Button>} />
    <DialogContent className="max-h-[90vh] overflow-y-auto border-border/80 bg-card/90 p-0 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:max-w-2xl">
      <div className="border-b border-border/70 px-6 py-5"><DialogHeader><div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-border bg-muted/50"><Layers3 className="size-5" /></div><DialogTitle className="text-xl">Add new task</DialogTitle><DialogDescription className="text-muted-foreground">Set a rhythm, choose a tracker, and map where the XP goes.</DialogDescription></DialogHeader></div>
      <div className="flex flex-col gap-6 px-6 py-6">
        <div className="flex flex-col gap-2"><Label htmlFor="task-title">Task title</Label><Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Read for 20 minutes" className="h-11 bg-background/50" /></div>
        <div className="grid gap-5 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="frequency">Frequency</Label><Select value={frequency} onValueChange={(value) => setFrequency(value ?? 'daily')}><SelectTrigger id="frequency" className="h-11 bg-background/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="weekly">Weekly</SelectItem><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div><div className="flex flex-col gap-2"><Label>Tracking method</Label><ToggleGroup value={[tracking]} onValueChange={(value) => value[0] && setTracking(value[0])} variant="outline" className="h-11 w-full"><ToggleGroupItem value="manual" className="flex-1">Manual</ToggleGroupItem><ToggleGroupItem value="auto" className="flex-1">Auto-Sync</ToggleGroupItem></ToggleGroup></div></div>
        {frequency === 'weekly' && <div className="flex flex-col gap-2"><Label>Repeat on</Label><ToggleGroup type="multiple" value={days} onValueChange={setDays} className="justify-start gap-2"><>{weekdays.map((day, i) => <ToggleGroupItem key={`${day}-${i}`} value={day} aria-label={`Repeat on ${day}`} className="size-9 rounded-full border border-border bg-background/40 p-0 data-[state=on]:bg-foreground data-[state=on]:text-background">{day}</ToggleGroupItem>)}</></ToggleGroup></div>}
        {tracking === 'auto' && <div className="rounded-xl border border-border/70 bg-background/30 p-4"><div className="mb-4 flex items-center gap-2 text-sm font-medium"><GitBranch className="size-4" /> Sync source</div><div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]"><div className="flex flex-col gap-2"><Label htmlFor="platform">Platform</Label><Select defaultValue="github"><SelectTrigger id="platform" className="bg-background/50"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="github"><span className="flex items-center gap-2"><GitFork className="size-4" /> GitHub</span></SelectItem><SelectItem value="leetcode"><span className="flex items-center gap-2"><Code2 className="size-4" /> LeetCode</span></SelectItem><SelectItem value="codeforces"><span className="flex items-center gap-2"><Terminal className="size-4" /> Codeforces</span></SelectItem></SelectContent></Select></div><div className="flex flex-col gap-2"><Label htmlFor="handle">Username / handle</Label><Input id="handle" placeholder="your-handle" className="bg-background/50" /></div><div className="flex flex-col gap-2"><Label htmlFor="goal">Daily goal</Label><Input id="goal" type="number" min="1" placeholder="2" className="bg-background/50" /></div></div></div>}
        <div className="flex flex-col gap-3"><div><Label>Category mapping</Label><p className="mt-1 text-xs text-muted-foreground">Choose the region that receives this task&apos;s XP.</p></div><div className="grid gap-2 sm:grid-cols-2">{categories.map(({ name, icon: Icon, hint }) => <button type="button" key={name} onClick={() => setCategory(name)} className={cn('flex items-center gap-3 rounded-xl border border-border/70 bg-background/30 p-3 text-left transition-colors hover:bg-accent', category === name && 'border-foreground bg-accent')}><span className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/50"><Icon className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{name}</span><span className="block truncate text-xs text-muted-foreground">{hint}</span></span>{category === name && <Check className="size-4" />}</button>)}</div></div>
      </div>
      <DialogFooter className="border-t border-border/70 bg-background/20 px-6 py-4"><DialogClose render={<Button variant="ghost">Cancel</Button>} /><Button onClick={createTask} disabled={!title.trim()}>Create task</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}

export function AddTaskButton() { return <AddTaskDialog /> }
