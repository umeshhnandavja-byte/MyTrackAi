'use client'

import { motion } from 'framer-motion'
import { useCategories } from '@/lib/category-store'
import { useTasks } from '@/lib/task-store'
import { Activity, BarChart3, Flame, GitCommit, Target, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useEffect, useRef, useState } from 'react'

const heatTone = ['bg-muted/60', 'bg-foreground/25', 'bg-foreground/45', 'bg-foreground/70', 'bg-foreground']

export function AnalyticsView() {
  const categories = useCategories()
  const tasks = useTasks()
  
  const radarData = categories.map((category) => {
    const categoryCompletedCount = tasks.filter(t => t.program === category.name && t.completed).length
    return { 
      subject: category.name, 
      value: Math.max(10, Math.min(100, category.value + categoryCompletedCount * 15)) 
    }
  })

  const totalCompletedCount = tasks.filter(t => t.completed).length

  // True GitHub-style 365-day contribution matrix mapping actual task completion dates
  const today = new Date()
  const heat = Array.from({ length: 365 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (364 - i))
    const dateString = d.toDateString()
    
    const count = tasks.filter(t => {
      if (!t.lastCompletedAt) return false
      return new Date(t.lastCompletedAt).toDateString() === dateString
    }).length

    if (count >= 4) return 4
    if (count === 3) return 3
    if (count === 2) return 2
    if (count === 1) return 1
    return 0
  })

  const matrixScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (matrixScrollRef.current) {
      matrixScrollRef.current.scrollLeft = matrixScrollRef.current.scrollWidth
    }
  }, [heat])

  // True 30-day consistency trend graph mapped from task history
  const trend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (29 - i))
    const dateString = d.toDateString()
    
    const count = tasks.filter(t => {
      if (!t.lastCompletedAt) return false
      return new Date(t.lastCompletedAt).toDateString() === dateString
    }).length

    const score = Math.min(100, (count * 30) + (totalCompletedCount > 0 ? 35 : 15))
    return { day: `${d.getDate()}`, score }
  })

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Performance systems</p>
        <h2 className="text-3xl font-semibold tracking-tight">Analytics &amp; Stats</h2>
        <p className="mt-2 text-sm text-muted-foreground">A clear read on your consistency, focus, and momentum.</p>
      </div>
      
      <PlatformTrends />
      
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.8fr)]">
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2"><Activity className="size-4" /><h3 className="font-semibold">Daily Streak Contribution Matrix</h3></div>
              <p className="mt-1 text-sm text-muted-foreground">Your past year of actual task activity.</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Completed Tasks</p>
              <p className="text-lg font-semibold">{totalCompletedCount}</p>
            </div>
          </div>
          <div ref={matrixScrollRef} className="mt-6 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2 scrollbar-none" aria-label="Activity heatmap">
            {heat.map((level, i) => <span key={i} title={`Activity level ${level}`} className={`size-3 rounded-[3px] ${heatTone[level]}`} />)}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Total tasks completed <strong className="text-foreground">{totalCompletedCount}</strong></span>
            <span className="flex items-center gap-1">Less <span className="size-2 rounded-sm bg-muted/60" /><span className="size-2 rounded-sm bg-foreground/45" /><span className="size-2 rounded-sm bg-foreground" /> More</span>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-xl sm:p-6">
          <div className="flex items-center gap-2"><Target className="size-4" /><h3 className="font-semibold">Life RPG Stats</h3></div>
          <p className="mt-1 text-sm text-muted-foreground">Focus distribution by region.</p>
          <div className="mt-4 w-full h-56 min-h-[224px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="oklch(1 0 0 / .14)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'oklch(.65 0 0)', fontSize: 10 }} />
                <Radar dataKey="value" stroke="oklch(.9 0 0)" fill="oklch(.9 0 0)" fillOpacity={.18} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>
      </div>

      <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-6 rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-xl sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2"><TrendingUp className="size-4" /><h3 className="font-semibold">Task Consistency Over Time</h3></div>
            <p className="mt-1 text-sm text-muted-foreground">Completion quality across the last 30 days.</p>
          </div>
          <span className="flex items-center gap-2 text-sm text-muted-foreground"><Flame className="size-4" /> Live tracking</span>
        </div>
        <div className="mt-6 w-full h-64 min-h-[256px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="consistency-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(.9 0 0)" stopOpacity={.24} />
                  <stop offset="100%" stopColor="oklch(.9 0 0)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="oklch(1 0 0 / .08)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'oklch(.55 0 0)', fontSize: 11 }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'oklch(.13 0 0)', border: '1px solid oklch(1 0 0 / .15)', borderRadius: 10, color: 'oklch(.94 0 0)' }} />
              <Area type="monotone" dataKey="score" stroke="oklch(.94 0 0)" strokeWidth={2} fill="url(#consistency-fill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>
    </main>
  )
}

// Fixed naming and passed exact API timestamps logic
export function RealTimeContributionGrid({ timestamps }: { timestamps: Record<string, number> }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth
    }
  }, [timestamps])

  const today = new Date()
  
  const levels = Array.from({ length: 365 }, (_, index) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (364 - index))
    
    // Format current block to exact YYYY-MM-DD
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    
    // Force cast to Number (fixes CodeChef API returning strings instead of integers)
    const count = Number(timestamps?.[dateStr]) || 0
    return count >= 10 ? 4 : count >= 5 ? 3 : count >= 2 ? 2 : count >= 1 ? 1 : 0
  })

  return (
    <div ref={scrollRef} className="grid auto-cols-max grid-flow-col grid-rows-7 gap-1 overflow-x-auto scrollbar-none" aria-label="Platform contribution trend">
      {levels.map((level, index) => (
        <span key={index} title={`${level} contributions`} className={`size-2.5 rounded-[2px] ${heatTone[level]}`} />
      ))}
    </div>
  )
}

export function PlatformTrends() {
  const [handles, setHandles] = useState({
    github: '',
    leetcode: '',
    codeforces: '',
    codechef: ''
  })
  
  const [isHandlesLoaded, setIsHandlesLoaded] = useState(false)

  const [data, setData] = useState({
    github: { total: 0, streak: '...', timestamps: {} as Record<string, number> },
    leetcode: { total: 0, streak: '...', timestamps: {} as Record<string, number> },
    codeforces: { total: 0, streak: '...', timestamps: {} as Record<string, number> },
    codechef: { total: 0, streak: '...', timestamps: {} as Record<string, number> }
  })

  // Load handles securely
  useEffect(() => {
    const loadHandles = () => {
      setHandles({
        github: localStorage.getItem('mytrack_github_handle') || 'torvalds',
        leetcode: localStorage.getItem('mytrack_leetcode_handle') || 'striver_79',
        codeforces: localStorage.getItem('mytrack_codeforces_handle') || 'tourist',
        codechef: localStorage.getItem('mytrack_codechef_handle') || 'gennady.korotkevich'
      })
      setIsHandlesLoaded(true)
    }
    
    loadHandles()
    window.addEventListener('handles_updated', loadHandles)
    return () => window.removeEventListener('handles_updated', loadHandles)
  }, [])

  // Fetch API data securely
  useEffect(() => {
    if (!isHandlesLoaded) return
    let isActive = true

    // 1. Fetch Codeforces
    fetch(`https://codeforces.com/api/user.status?handle=${handles.codeforces}`)
      .then(res => res.json())
      .then(cfData => {
        if (!isActive) return
        if (cfData.status === 'OK') {
          const cfTimestamps: Record<string, number> = {}
          let cfTotal = 0
          cfData.result.forEach((sub: any) => {
            const d = new Date(sub.creationTimeSeconds * 1000)
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            cfTimestamps[dateStr] = (cfTimestamps[dateStr] || 0) + 1
            cfTotal++
          })
          setData(prev => ({ ...prev, codeforces: { total: cfTotal, streak: 'Live synced', timestamps: cfTimestamps } }))
        }
      }).catch(err => console.error("CF Error", err))

    // 2. Fetch LeetCode
    fetch(`https://alfa-leetcode-api.onrender.com/${handles.leetcode}/calendar`)
      .then(res => res.json())
      .then(lcData => {
        if (!isActive) return
        if (lcData.submissionCalendar) {
          const lcRaw = JSON.parse(lcData.submissionCalendar)
          const lcTimestamps: Record<string, number> = {}
          let lcTotal = 0
          for (const [ts, count] of Object.entries(lcRaw)) {
            const d = new Date(parseInt(ts) * 1000)
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            const val = Number(count) || 0
            lcTimestamps[dateStr] = (lcTimestamps[dateStr] || 0) + val
            lcTotal += val
          }
          setData(prev => ({ ...prev, leetcode: { total: lcTotal, streak: 'Live synced', timestamps: lcTimestamps } }))
        }
      }).catch(err => console.error("LC Error", err))

    // 3. Fetch GitHub
    fetch(`https://github-contributions-api.deno.dev/${handles.github}.json`)
      .then(res => res.json())
      .then(ghData => {
        if (!isActive) return
        if (ghData.contributions) {
          const ghTimestamps: Record<string, number> = {}
          let ghTotal = 0
          // Force extreme deep flatten in case API structures change
          const days = Array.isArray(ghData.contributions) ? ghData.contributions.flat(Infinity) : []
          
          days.forEach((day: any) => {
            if (day && day.date) {
              // Parse date exactly as passed without letting the Date object shift timezones
              const [y, m, d] = day.date.split('-')
              if (y && m && d) {
                const dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
                const val = Number(day.contributionCount) || 0
                ghTimestamps[dateStr] = val
                ghTotal += val
              }
            }
          })
          setData(prev => ({ ...prev, github: { total: ghTotal, streak: 'Live synced', timestamps: ghTimestamps } }))
        }
      }).catch(err => console.error("GitHub Error", err))

    // 4. Fetch CodeChef
    fetch(`https://codechef-api.vercel.app/handle/${handles.codechef}`)
      .then(res => res.json())
      .then(ccData => {
        if (!isActive) return
        if (ccData.heatMap) {
          const ccTimestamps: Record<string, number> = {}
          let ccTotal = 0
          
          ccData.heatMap.forEach((day: any) => {
            if (day && day.date) {
              let dateStr = day.date
              // Parse date directly if it includes dashes to avoid timezone shifts
              if (day.date.includes('-')) {
                const parts = day.date.split('-')
                if (parts.length === 3) {
                  dateStr = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
                }
              }
              // Force string conversion into numbers here!
              const val = Number(day.value) || 0
              ccTimestamps[dateStr] = val
              ccTotal += val
            }
          })
          setData(prev => ({ ...prev, codechef: { total: ccTotal, streak: 'Live synced', timestamps: ccTimestamps } }))
        }
      }).catch(err => console.error("CodeChef Error", err))

    return () => { isActive = false }
  }, [handles, isHandlesLoaded]) 

  const platforms = [
    { name: 'GitHub', icon: GitCommit, ...data.github },
    { name: 'LeetCode', icon: Flame, ...data.leetcode },
    { name: 'Codeforces', icon: Target, ...data.codeforces },
    { name: 'CodeChef', icon: BarChart3, ...data.codechef } 
  ]

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-xl sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            <h3 className="font-semibold">Platform contribution trends</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Real-time GitHub-style activity synced from your coding profiles.</p>
        </div>
        <span className="text-xs text-muted-foreground">Last 365 days</span>
      </div>
      
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {platforms.map(({ name, icon: Icon, total, streak, timestamps }) => (
          <div key={name} className="rounded-xl border border-border/70 bg-background/35 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted/30">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{streak}</p>
                </div>
              </div>
              <p className="text-sm font-semibold">{total}<span className="ml-1 text-xs font-normal text-muted-foreground">contributions</span></p>
            </div>
            
            <div className="mt-4">
              <RealTimeContributionGrid timestamps={timestamps} />
            </div>
            
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>365 days ago</span>
              <span className="flex items-center gap-1">
                Less <i className="size-2 rounded-[2px] bg-muted/60" /><i className="size-2 rounded-[2px] bg-foreground/45" /><i className="size-2 rounded-[2px] bg-foreground" /> More
              </span>
              <span>Today</span>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}

export function PlatformTrends() {
  // 1. Start with completely empty handles so it doesn't fetch defaults prematurely
  const [handles, setHandles] = useState({
    github: '',
    leetcode: '',
    codeforces: '',
    codechef: ''
  })
  
  // Track when we've securely loaded handles from local storage
  const [isHandlesLoaded, setIsHandlesLoaded] = useState(false)

  // 2. Data State
  const [data, setData] = useState({
    github: { total: 0, streak: '...', timestamps: {} as Record<string, number> },
    leetcode: { total: 0, streak: '...', timestamps: {} as Record<string, number> },
    codeforces: { total: 0, streak: '...', timestamps: {} as Record<string, number> },
    codechef: { total: 0, streak: '...', timestamps: {} as Record<string, number> }
  })

  // 3. Load custom handles securely from Settings (localStorage)
  useEffect(() => {
    const loadHandles = () => {
      setHandles({
        github: localStorage.getItem('mytrack_github_handle') || 'torvalds',
        leetcode: localStorage.getItem('mytrack_leetcode_handle') || 'striver_79',
        codeforces: localStorage.getItem('mytrack_codeforces_handle') || 'tourist',
        codechef: localStorage.getItem('mytrack_codechef_handle') || 'gennady.korotkevich'
      })
      setIsHandlesLoaded(true) // Signal that we are ready to fetch!
    }
    
    loadHandles()
    window.addEventListener('handles_updated', loadHandles)
    return () => window.removeEventListener('handles_updated', loadHandles)
  }, [])

  // 4. Fetch data safely ONLY after handles are loaded
  useEffect(() => {
    if (!isHandlesLoaded) return; // Prevent premature default fetches
    
    // Cleanup flag: Prevents old, slow network requests from overwriting newer ones!
    let isActive = true;

    // 1. Fetch Codeforces
    fetch(`https://codeforces.com/api/user.status?handle=${handles.codeforces}`)
      .then(res => res.json())
      .then(cfData => {
        if (!isActive) return; // Drop stale request
        if (cfData.status === 'OK') {
          const cfTimestamps: Record<string, number> = {}
          let cfTotal = 0
          cfData.result.forEach((sub: any) => {
            const d = new Date(sub.creationTimeSeconds * 1000)
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            cfTimestamps[dateStr] = (cfTimestamps[dateStr] || 0) + 1
            cfTotal++
          })
          setData(prev => ({ ...prev, codeforces: { total: cfTotal, streak: 'Live synced', timestamps: cfTimestamps } }))
        }
      }).catch(err => console.error("CF Error", err))

    // 2. Fetch LeetCode
    fetch(`https://alfa-leetcode-api.onrender.com/${handles.leetcode}/calendar`)
      .then(res => res.json())
      .then(lcData => {
        if (!isActive) return;
        if (lcData.submissionCalendar) {
          const lcRaw = JSON.parse(lcData.submissionCalendar)
          const lcTimestamps: Record<string, number> = {}
          let lcTotal = 0
          for (const [ts, count] of Object.entries(lcRaw)) {
            const d = new Date(parseInt(ts) * 1000)
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
            lcTimestamps[dateStr] = (lcTimestamps[dateStr] || 0) + (count as number)
            lcTotal += (count as number)
          }
          setData(prev => ({ ...prev, leetcode: { total: lcTotal, streak: 'Live synced', timestamps: lcTimestamps } }))
        }
      }).catch(err => console.error("LC Error", err))

    // 3. Fetch GitHub
    fetch(`https://github-contributions-api.deno.dev/${handles.github}.json`)
      .then(res => res.json())
      .then(ghData => {
        if (!isActive) return;
        if (ghData.contributions) {
          const ghTimestamps: Record<string, number> = {}
          let ghTotal = 0
          const days = Array.isArray(ghData.contributions[0]) ? ghData.contributions.flat() : ghData.contributions;
          days.forEach((day: any) => {
            if (day && day.date) {
              ghTimestamps[day.date] = day.contributionCount 
              ghTotal += day.contributionCount
            }
          })
          setData(prev => ({ ...prev, github: { total: ghTotal, streak: 'Live synced', timestamps: ghTimestamps } }))
        }
      }).catch(err => console.error("GitHub Error", err))

    // 4. Fetch CodeChef
    fetch(`https://codechef-api.vercel.app/handle/${handles.codechef}`)
      .then(res => res.json())
      .then(ccData => {
        if (!isActive) return;
        if (ccData.heatMap) {
          const ccTimestamps: Record<string, number> = {}
          let ccTotal = 0
          ccData.heatMap.forEach((day: any) => {
            if (day.date) {
              const d = new Date(day.date)
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
              ccTimestamps[dateStr] = day.value || 0
              ccTotal += (day.value || 0)
            }
          })
          setData(prev => ({ ...prev, codechef: { total: ccTotal, streak: 'Live synced', timestamps: ccTimestamps } }))
        }
      }).catch(err => console.error("CodeChef Error", err))

    // Cleanup: Tells running fetches to abort updating state if handles changed again
    return () => { isActive = false; }

  }, [handles, isHandlesLoaded]) 

  const platforms = [
    { name: 'GitHub', icon: GitCommit, ...data.github },
    { name: 'LeetCode', icon: Flame, ...data.leetcode },
    { name: 'Codeforces', icon: Target, ...data.codeforces },
    { name: 'CodeChef', icon: BarChart3, ...data.codechef } 
  ]

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-xl sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4" />
            <h3 className="font-semibold">Platform contribution trends</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Real-time GitHub-style activity synced from your coding profiles.</p>
        </div>
        <span className="text-xs text-muted-foreground">Last 365 days</span>
      </div>
      
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {platforms.map(({ name, icon: Icon, total, streak, timestamps }) => (
          <div key={name} className="rounded-xl border border-border/70 bg-background/35 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted/30">
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{name}</p>
                  <p className="text-xs text-muted-foreground">{streak}</p>
                </div>
              </div>
              <p className="text-sm font-semibold">{total}<span className="ml-1 text-xs font-normal text-muted-foreground">contributions</span></p>
            </div>
            
            <div className="mt-4">
              <RealTimeContributionGrid timestamps={timestamps} />
            </div>
            
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>365 days ago</span>
              <span className="flex items-center gap-1">
                Less <i className="size-2 rounded-[2px] bg-muted/60" /><i className="size-2 rounded-[2px] bg-foreground/45" /><i className="size-2 rounded-[2px] bg-foreground" /> More
              </span>
              <span>Today</span>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
export const AnalyticsPage = AnalyticsView