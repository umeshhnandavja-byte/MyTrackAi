"use client"

import { useEffect, useState } from "react"
import { ArrowUpRight, Radio, Swords, Loader2, Flame, ChefHat, Target } from "lucide-react"
import { motion } from "framer-motion"
import { buttonVariants } from "@/components/ui/button"

type UnifiedContest = {
  id: string
  name: string
  platform: 'Codeforces' | 'LeetCode' | 'CodeChef'
  startTimeSeconds: number
  url: string
}

// 1. Math-based generator for strictly scheduled platforms (Zero API latency/downtime!)
function getFixedContests(): UnifiedContest[] {
  const now = new Date()
  const contests: UnifiedContest[] = []

  // LeetCode Weekly (Every Sunday 02:30 UTC) -> Reference: Weekly 412 on Aug 25, 2024
  const lcWRef = new Date("2024-08-25T02:30:00Z")
  const weekMs = 7 * 24 * 3600 * 1000
  let lcWCycles = Math.ceil((now.getTime() - lcWRef.getTime()) / weekMs)
  if (lcWCycles < 0) lcWCycles = 0
  contests.push({
    id: `lcw-${412 + lcWCycles}`,
    name: `Weekly Contest ${412 + lcWCycles}`,
    platform: 'LeetCode',
    startTimeSeconds: Math.floor((lcWRef.getTime() + (lcWCycles * weekMs)) / 1000),
    url: `https://leetcode.com/contest/weekly-contest-${412 + lcWCycles}`
  })

  // LeetCode Biweekly (Every other Saturday 14:30 UTC) -> Reference: Biweekly 138 on Aug 31, 2024
  const lcBRef = new Date("2024-08-31T14:30:00Z")
  const biweekMs = 14 * 24 * 3600 * 1000
  let lcBCycles = Math.ceil((now.getTime() - lcBRef.getTime()) / biweekMs)
  if (lcBCycles < 0) lcBCycles = 0
  contests.push({
    id: `lcb-${138 + lcBCycles}`,
    name: `Biweekly Contest ${138 + lcBCycles}`,
    platform: 'LeetCode',
    startTimeSeconds: Math.floor((lcBRef.getTime() + (lcBCycles * biweekMs)) / 1000),
    url: `https://leetcode.com/contest/biweekly-contest-${138 + lcBCycles}`
  })

  // CodeChef Starters (Every Wednesday 14:30 UTC) -> Reference: Starters 150 on Sep 4, 2024
  const ccRef = new Date("2024-09-04T14:30:00Z")
  let ccCycles = Math.ceil((now.getTime() - ccRef.getTime()) / weekMs)
  if (ccCycles < 0) ccCycles = 0
  contests.push({
    id: `cc-${150 + ccCycles}`,
    name: `Starters ${150 + ccCycles}`,
    platform: 'CodeChef',
    startTimeSeconds: Math.floor((ccRef.getTime() + (ccCycles * weekMs)) / 1000),
    url: `https://www.codechef.com/contests`
  })

  return contests
}

// 2. Helper to format the countdown cleanly
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
  const [contests, setContests] = useState<UnifiedContest[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(Date.now())

  // 3. Fetch Codeforces dynamically & merge with our mathematically generated contests
  useEffect(() => {
    async function fetchContests() {
      let combined = getFixedContests()

      try {
        const res = await fetch('https://codeforces.com/api/contest.list?gym=false')
        const data = await res.json()
        if (data.status === 'OK') {
          const cfUpcoming = data.result
            .filter((c: any) => c.phase === 'BEFORE')
            .map((c: any) => ({
              id: `cf-${c.id}`,
              name: c.name,
              platform: 'Codeforces',
              startTimeSeconds: c.startTimeSeconds,
              url: `https://codeforces.com/contests/${c.id}`
            }))
          
          combined = [...combined, ...cfUpcoming]
        }
      } catch (error) {
        console.error('Failed to fetch codeforces, falling back to scheduled contests', error)
      } finally {
        // Sort everything by closest date and take top 5
        const sorted = combined
          .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
          .slice(0, 5)
          
        setContests(sorted)
        setLoading(false)
      }
    }
    fetchContests()
  }, [])

  // Keep countdown updated every 30 seconds
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000)
    return () => window.clearInterval(timer)
  }, [])

  // Map platform to its unique icon
  const platformIcons = {
    LeetCode: Flame,
    CodeChef: ChefHat,
    Codeforces: Target
  }

  return (
    <section className="mt-8 w-full max-w-none rounded-2xl border border-border/70 bg-card/45 p-5 shadow-2xl shadow-black/20 backdrop-blur-md" aria-labelledby="contests-heading">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="size-4 text-muted-foreground" />
            <h2 id="contests-heading" className="text-lg font-semibold tracking-tight">Upcoming Coding Contests</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Live circuit schedule</p>
        </div>
        <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {loading ? "Syncing..." : `${contests.length} events`}
        </span>
      </div>
      
      <div className="flex max-h-72 flex-col overflow-y-auto pr-1">
        {loading ? (
          <div className="flex h-24 items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : contests.length === 0 ? (
          <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
            No upcoming contests found.
          </div>
        ) : (
          contests.map((contest, index) => {
            const startsIn = (contest.startTimeSeconds * 1000) - now
            const live = startsIn <= 0
            const Icon = platformIcons[contest.platform] || Swords

            return (
              <motion.div 
                key={contest.id} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: index * 0.08 }} 
                className="group flex items-center gap-3 border-t border-border/60 py-3 first:border-t-0"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background/50 text-muted-foreground">
                  <Icon className="size-4" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{contest.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{contest.platform}</p>
                </div>
                
                <div className="hidden items-center gap-1.5 rounded-full border border-border bg-background/35 px-2.5 py-1 font-mono text-[10px] text-muted-foreground sm:flex">
                  <span className={`size-1.5 rounded-full ${live ? "animate-pulse bg-foreground" : "bg-muted-foreground/60"}`} />
                  {formatTime(startsIn)}
                </div>
                
                <a 
                  className={buttonVariants({ variant: "secondary", size: "sm" })} 
                  href={contest.url} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  Join <ArrowUpRight data-icon="inline-end" />
                </a>
              </motion.div>
            )
          })
        )}
      </div>
    </section>
  )
}