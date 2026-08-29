'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function CustomTimer() {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(25)
  const [seconds, setSeconds] = useState(0)
  const [remaining, setRemaining] = useState(1500)
  const [running, setRunning] = useState(false)
  useEffect(() => { if (!running) return; const id = window.setInterval(() => setRemaining((value) => { if (value <= 1) { setRunning(false); return 0 }; return value - 1 }), 1000); return () => window.clearInterval(id) }, [running])
  const format = (value: number) => String(value).padStart(2, '0')
  function applyTime() { setRemaining(Math.max(0, hours * 3600 + minutes * 60 + seconds)) }
  function reset() { setRunning(false); setRemaining(Math.max(0, hours * 3600 + minutes * 60 + seconds)) }
  return <div className="grid gap-4"><div className="flex items-center justify-center gap-2"><label className="grid gap-1 text-center text-xs text-muted-foreground">HH<input aria-label="Timer hours" type="number" min="0" max="99" value={hours} onChange={(event) => setHours(Math.max(0, Number(event.target.value)))} className="h-10 w-16 rounded-lg border border-input bg-background px-2 text-center text-lg" /></label><span className="pt-5 text-xl">:</span><label className="grid gap-1 text-center text-xs text-muted-foreground">MM<input aria-label="Timer minutes" type="number" min="0" max="59" value={minutes} onChange={(event) => setMinutes(Math.min(59, Math.max(0, Number(event.target.value))))} className="h-10 w-16 rounded-lg border border-input bg-background px-2 text-center text-lg" /></label><span className="pt-5 text-xl">:</span><label className="grid gap-1 text-center text-xs text-muted-foreground">SS<input aria-label="Timer seconds" type="number" min="0" max="59" value={seconds} onChange={(event) => setSeconds(Math.min(59, Math.max(0, Number(event.target.value))))} className="h-10 w-16 rounded-lg border border-input bg-background px-2 text-center text-lg" /></label></div><p className="text-center font-mono text-4xl font-semibold tabular-nums">{format(Math.floor(remaining / 3600))}:{format(Math.floor(remaining / 60) % 60)}:{format(remaining % 60)}</p><div className="flex justify-center gap-2"><Button onClick={() => { applyTime(); setRunning(true) }}>{running ? 'Running' : 'Start'}</Button><Button variant="outline" onClick={() => setRunning(false)}>Pause</Button><Button variant="outline" onClick={() => { setRunning(false); setRemaining(0) }}>Stop</Button><Button variant="outline" onClick={reset}>Reset</Button></div></div>
}
