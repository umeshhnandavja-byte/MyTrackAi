'use client'

import { useState } from 'react'
import { Play, Pause, RotateCcw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useGlobalTimer, setTimerMode, toggleTimerRun, resetTimerState, setTimerDuration } from '@/lib/timer-store'

export function CustomTimer() {
  const { timeLeft, isRunning, mode } = useGlobalTimer()
  
  const [customInputMinutes, setCustomInputMinutes] = useState('30')
  const [showCustomInput, setShowCustomInput] = useState(mode === 'custom')

  const handleModeChange = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom') => {
    if (newMode === 'custom') {
      setShowCustomInput(true)
      setTimerMode('custom')
      return
    }
    setShowCustomInput(false)
    setTimerMode(newMode)
  }

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseInt(customInputMinutes, 10)
    if (isNaN(parsed) || parsed <= 0) return
    setTimerDuration(parsed * 60)
    setShowCustomInput(false)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-center rounded-xl border border-border bg-background/50 p-1 gap-1">
        <button
          onClick={() => handleModeChange('pomodoro')}
          className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', mode === 'pomodoro' && !showCustomInput ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
        >
          Pomodoro (25m)
        </button>
        <button
          onClick={() => handleModeChange('shortBreak')}
          className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', mode === 'shortBreak' && !showCustomInput ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
        >
          Short (5m)
        </button>
        <button
          onClick={() => handleModeChange('longBreak')}
          className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', mode === 'longBreak' && !showCustomInput ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
        >
          Long (15m)
        </button>
        <button
          onClick={() => handleModeChange('custom')}
          className={cn('rounded-lg px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1', showCustomInput ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}
        >
          <Clock className="size-3.5" /> Custom
        </button>
      </div>

      {showCustomInput ? (
        <form onSubmit={handleCustomSubmit} className="flex flex-col items-center gap-4 py-4 w-full max-w-[240px]">
          <div className="flex flex-col gap-1.5 w-full text-center">
            <label className="text-xs text-muted-foreground font-medium">Enter custom duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="1440"
              value={customInputMinutes}
              onChange={(e) => setCustomInputMinutes(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-center text-lg font-mono"
              autoFocus
              required
            />
          </div>
          <Button type="submit" size="sm" className="w-full">Set & Start</Button>
        </form>
      ) : (
        <>
          {/* Timer Display */}
          <div className="flex flex-col items-center justify-center py-6">
            <span className="font-mono text-6xl font-bold tracking-tight">{formattedTime}</span>
            <span className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
              {isRunning ? 'Focus session in progress' : 'Paused'}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            <Button onClick={toggleTimerRun} size="lg" className="gap-2 px-6">
              {isRunning ? <><Pause className="size-4" /> Pause</> : <><Play className="size-4" /> Start</>}
            </Button>
            <Button onClick={resetTimerState} variant="outline" size="icon" aria-label="Reset timer" title="Reset">
              <RotateCcw className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}