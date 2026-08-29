"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, Braces, ChefHat, Flame, Radio, Swords } from "lucide-react"
import { motion } from "framer-motion"
import { buttonVariants } from "@/components/ui/button"

const contests = [
  { platform: "LeetCode", name: "Weekly Contest 412", startsIn: 2 * 60 * 60 * 1000 + 15 * 60 * 1000, icon: Flame, href: "https://leetcode.com/contest/" },
  { platform: "Codeforces", name: "Round 977 (Div. 2)", startsIn: 7 * 60 * 60 * 1000 + 42 * 60 * 1000, icon: Swords, href: "https://codeforces.com/contests" },
  { platform: "CodeChef", name: "Starters 154", startsIn: 24 * 60 * 60 * 1000 + 10 * 60 * 1000, icon: ChefHat, href: "https://www.codechef.com/contests" },
  { platform: "AtCoder", name: "ABC 374", startsIn: 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000, icon: Braces, href: "https://atcoder.jp/contests/" },
]

function formatTime(ms: number) {
  if (ms <= 0) return "Live now"
  const totalMinutes = Math.floor(ms / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  if (days > 0) return `Starts in ${days}d ${hours}h`
  return `Starts in ${hours}h ${minutes}m`
}

export function UpcomingContests() {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const startedAt = Date.now()
    const timer = window.setInterval(() => setElapsed(Date.now() - startedAt), 30000)
    return () => window.clearInterval(timer)
  }, [])

  return (
    <section className="mt-8 w-full max-w-none rounded-2xl border border-border/70 bg-card/45 p-5 shadow-2xl shadow-black/20 backdrop-blur-md" aria-labelledby="contests-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><Radio className="size-4 text-muted-foreground" /><h2 id="contests-heading" className="text-lg font-semibold tracking-tight">Upcoming Coding Contests</h2></div>
          <p className="mt-1 text-xs text-muted-foreground">Live circuit schedule</p>
        </div>
        <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">4 events</span>
      </div>
      <div className="flex max-h-72 flex-col overflow-y-auto pr-1">
        {contests.map((contest, index) => {
          const Icon = contest.icon
          const live = contest.startsIn <= elapsed
          return (
            <motion.div key={contest.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="group flex items-center gap-3 border-t border-border/60 py-3 first:border-t-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground"><Icon className="size-4" /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{contest.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{contest.platform}</p></div>
              <div className="hidden items-center gap-1.5 rounded-full border border-border bg-background/35 px-2.5 py-1 font-mono text-[10px] text-muted-foreground sm:flex"><span className={`size-1.5 rounded-full ${live ? "animate-pulse bg-foreground" : "bg-muted-foreground/60"}`} />{formatTime(contest.startsIn - elapsed)}</div>
              <a className={buttonVariants({ variant: "secondary", size: "sm" })} href={contest.href} target="_blank" rel="noreferrer">Join <ArrowUpRight data-icon="inline-end" /></a>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
