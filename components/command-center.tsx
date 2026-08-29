'use client'

import { useState } from 'react'
import { addTask } from '@/lib/task-store'
import { Button } from '@/components/ui/button'

export function CommandCenter() {
  const [prompt, setPrompt] = useState('')
  const [draft, setDraft] = useState<{ name: string; cadence: string; streak: number } | null>(null)
  const [saved, setSaved] = useState(false)
  function prepare() {
    const duration = prompt.match(/(\d+)\s*(?:min|minute|minutes)/i)?.[1]
    const name = prompt.replace(/^add\s+(?:a\s+)?/i, '').replace(/\s+for\s+(?:\d+\s*)?(?:min|minute|minutes)/i, '').replace(/\s+(?:tomorrow|today)$/i, '').trim()
    if (name) setDraft({ name: name.charAt(0).toUpperCase() + name.slice(1), cadence: prompt.toLowerCase().includes('weekly') ? 'Weekly' : 'Daily', streak: 0 })
    else setDraft({ name: duration ? `Focus session (${duration} minutes)` : 'New task', cadence: 'Daily', streak: 0 })
    setSaved(false)
  }
  return <div className="grid gap-4"><div className="flex gap-2"><input autoFocus value={prompt} onChange={(event) => setPrompt(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) prepare() }} placeholder="Try: add a 30 minute reading task tomorrow" aria-label="AI task prompt" className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm" /><Button onClick={prepare}>Prepare</Button></div>{draft && <div className="rounded-xl border border-border bg-background/50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task draft</p><p className="mt-2 font-medium">{draft.name}</p><p className="mt-1 text-xs text-muted-foreground">{draft.cadence} · Ready for review</p><div className="mt-4 flex gap-2"><Button onClick={() => { addTask(draft); setSaved(true) }}>Add task</Button><Button variant="outline" onClick={() => setDraft(null)}>Discard</Button></div>{saved && <p className="mt-2 text-xs text-muted-foreground">Task added.</p>}</div>}</div>
}
