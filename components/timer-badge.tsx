'use client'

import { Timer } from 'lucide-react'
import { useGlobalTimer } from '@/lib/timer-store'
import { cn } from '@/lib/utils'

export function TimerBadge({ onClick }: { onClick: () => void }) {
  const { timeLeft, isRunning } = useGlobalTimer()

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <button 
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium transition-all hover:bg-accent",
        isRunning ? "border-primary/50 bg-primary/10 text-foreground animate-pulse" : "text-muted-foreground"
      )}
      title="Open focus timer"
    >
      <Timer className="size-4" />
      <span className="font-mono font-semibold">{formattedTime}</span>
      <span className="hidden sm:inline text-[10px] opacity-75">{isRunning ? 'Running' : 'Paused'}</span>
    </button>
  )
}