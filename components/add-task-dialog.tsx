'use client'

import { useState, useEffect } from 'react'
import { Check, Code2, Flame, GitBranch, GitFork, Layers3, Target, Terminal, Zap, Heart, Repeat2, Brain, Dumbbell, PlusCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { addTask } from '@/lib/task-store'
import { useCategories, addCategory } from '@/lib/category-store'

const weekdays = [
  { id: 'Sun', label: 'Sun' },
  { id: 'Mon', label: 'Mon' },
  { id: 'Tue', label: 'Tue' },
  { id: 'Wed', label: 'Wed' },
  { id: 'Thu', label: 'Thu' },
  { id: 'Fri', label: 'Fri' },
  { id: 'Sat', label: 'Sat' },
]

const categoryIcons: Record<string, React.ElementType> = {
  heart: Heart,
  repeat: Repeat2,
  code: Terminal,
  brain: Brain,
  target: Target,
  dumbbell: Dumbbell,
  flame: Flame,
}

export function AddTaskDialog() {
  const [open, setOpen] = useState(false)
  const storeCategories = useCategories()
  
  const [frequency, setFrequency] = useState('daily')
  const [tracking, setTracking] = useState('manual')
  const [days, setDays] = useState(['Mon', 'Wed', 'Fri'])
  const [category, setCategory] = useState('')
  const [title, setTitle] = useState('')

  // Auto-Sync State
  const [platform, setPlatform] = useState('github')
  const [handle, setHandle] = useState('')
  const [goal, setGoal] = useState('1')

  // New Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState<string>('target') // Default icon selection

  useEffect(() => {
    if (open && storeCategories.length > 0 && !category) {
      setCategory(storeCategories[0].name)
    }
  }, [open, storeCategories, category])

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setIsAddingCategory(false)
      return
    }
    // Pass the selected icon to your store
    await addCategory(newCategoryName, newCategoryIcon)
    setCategory(newCategoryName.trim()) 
    setNewCategoryName('')
    setNewCategoryIcon('target') // Reset
    setIsAddingCategory(false)
  }

  const createTask = () => { 
    if (!title.trim()) return; 
    
    const capitalizedFrequency = frequency.charAt(0).toUpperCase() + frequency.slice(1);
    
    addTask({ 
      name: title.trim(), 
      program: category || (storeCategories[0]?.name ?? 'General'), 
      cadence: capitalizedFrequency, 
      days: frequency === 'weekly' ? days : undefined, 
      streak: 0,
      // Pass the new tracking data to the store:
      tracking: tracking,
      platform: tracking === 'auto' ? platform : undefined,
      handle: tracking === 'auto' ? handle : undefined,
      goal: tracking === 'auto' ? Number(goal) : undefined
    }); 
    
    setTitle(''); 
    setHandle(''); // Reset handle
    setGoal('1');  // Reset goal
    setOpen(false) 
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="rounded-xl px-4"><Zap data-icon="inline-start" /> Add task</Button>} />
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border/80 bg-card/90 p-0 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:max-w-2xl">
        <div className="border-b border-border/70 px-6 py-5">
          <DialogHeader>
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl border border-border bg-muted/50"><Layers3 className="size-5" /></div>
            <DialogTitle className="text-xl">Add new task</DialogTitle>
            <DialogDescription className="text-muted-foreground">Set a rhythm, choose a tracker, and map where the XP goes.</DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex flex-col gap-6 px-6 py-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title">Task title</Label>
            <Input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Read for 20 minutes" className="h-11 bg-background/50" />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={(value) => setFrequency(value ?? 'daily')}>
                <SelectTrigger id="frequency" className="h-11 bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tracking method</Label>
              <ToggleGroup value={[tracking]} onValueChange={(value) => value[0] && setTracking(value[0])} variant="outline" className="h-11 w-full">
                <ToggleGroupItem value="manual" className="flex-1">Manual</ToggleGroupItem>
                <ToggleGroupItem value="auto" className="flex-1">Auto-Sync</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          
          {frequency === 'weekly' && (
            <div className="flex flex-col gap-2">
              <Label>Repeat on</Label>
              <ToggleGroup value={days} onValueChange={setDays} className="flex flex-wrap justify-start gap-2">
                <>
                  {weekdays.map((day) => (
                    <ToggleGroupItem 
                      key={day.id} 
                      value={day.id} 
                      aria-label={`Repeat on ${day.label}`} 
                      className="h-9 rounded-full border border-border bg-background/40 px-3 text-xs font-medium transition-colors data-[state=on]:bg-foreground data-[state=on]:text-background"
                    >
                      {day.label}
                    </ToggleGroupItem>
                  ))}
                </>
              </ToggleGroup>
            </div>
          )}
          
          {tracking === 'auto' && (
            <div className="rounded-xl border border-border/70 bg-background/30 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-medium"><GitBranch className="size-4" /> Sync source</div>
              <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px]">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="platform">Platform</Label>
                  {/* Wired up the platform Select */}
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger id="platform" className="bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="github"><span className="flex items-center gap-2"><GitFork className="size-4" /> GitHub</span></SelectItem>
                      <SelectItem value="leetcode"><span className="flex items-center gap-2"><Code2 className="size-4" /> LeetCode</span></SelectItem>
                      <SelectItem value="codeforces"><span className="flex items-center gap-2"><Terminal className="size-4" /> Codeforces</span></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="handle">Username / handle</Label>
                  {/* Wired up the handle Input */}
                  <Input id="handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="your-handle" className="bg-background/50" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="goal">Daily goal</Label>
                  {/* Wired up the goal Input */}
                  <Input id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} type="number" min="1" placeholder="2" className="bg-background/50" />
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <Label>Category mapping</Label>
                <p className="mt-1 text-xs text-muted-foreground">Choose the region that receives this task&apos;s XP.</p>
              </div>
              {!isAddingCategory && (
                <button 
                  type="button" 
                  onClick={() => setIsAddingCategory(true)}
                  className="mt-1 flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <PlusCircle className="size-3.5" /> Add category
                </button>
              )}
            </div>

            {isAddingCategory && (
              <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/40 p-3">
                <div className="flex items-center gap-2">
                  <Input 
                    autoFocus
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                    placeholder="New category name..." 
                    className="h-9 flex-1 border-border/50 bg-background/50 px-2 text-sm shadow-none focus-visible:ring-1" 
                  />
                  <Button type="button" onClick={handleCreateCategory} size="sm" className="h-9 rounded-lg px-4 text-xs">Save</Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); setNewCategoryIcon('target') }} className="size-9 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                    <X className="size-4" />
                  </Button>
                </div>
                
                {/* Logo Picker */}
                <div className="flex flex-wrap items-center gap-1.5 pl-1">
                  {Object.entries(categoryIcons).map(([key, Icon]) => (
                    <button
                      key={key}
                      type="button"
                      title={key}
                      onClick={() => setNewCategoryIcon(key)}
                      className={cn(
                        "flex size-7 items-center justify-center rounded-md border transition-colors",
                        newCategoryIcon === key 
                          ? "border-foreground bg-foreground text-background" 
                          : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <Icon className="size-3.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              {storeCategories.length === 0 && !isAddingCategory && (
                <div className="col-span-2 text-sm text-muted-foreground">No categories available. Add one to continue!</div>
              )}
              {storeCategories.map((cat) => {
                const Icon = categoryIcons[cat.image || ''] || Target
                return (
                  <button 
                    type="button" 
                    key={cat.id} 
                    onClick={() => setCategory(cat.name)} 
                    className={cn('flex items-center gap-3 rounded-xl border border-border/70 bg-background/30 p-3 text-left transition-colors hover:bg-accent', category === cat.name && 'border-foreground bg-accent')}
                  >
                    <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/50">
                      {cat.imageUrl ? <img src={cat.imageUrl} className="size-5 rounded object-cover" alt="" /> : <Icon className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{cat.name}</span>
                      <span className="block truncate text-xs text-muted-foreground">Track your progress</span>
                    </span>
                    {category === cat.name && <Check className="size-4" />}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
        <DialogFooter className="border-t border-border/70 bg-background/20 px-6 py-4">
          <DialogClose render={<Button variant="ghost">Cancel</Button>} />
          <Button onClick={createTask} disabled={!title.trim() || storeCategories.length === 0 || (tracking === 'auto' && !handle.trim())}>Create task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AddTaskButton() { return <AddTaskDialog /> }