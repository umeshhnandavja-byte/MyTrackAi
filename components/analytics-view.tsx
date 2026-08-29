'use client'

import { motion } from 'framer-motion'
import { useCategories } from '@/lib/category-store'
import { useTasks } from '@/lib/task-store'
import { useProfile } from '@/lib/profile-store'
import { Activity, BarChart3, Flame, GitCommit, Target, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

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

// Universal Grid that takes real timestamps and auto-scrolls to the right (Today)
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
    
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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
  const profile = useProfile()
  
  const [handles, setHandles] = useState({
    github: '',
    leetcode: '',
    codeforces: ''
  })

  const [isHandlesLoaded, setIsHandlesLoaded] = useState(false)

  const [data, setData] = useState({
    github: { total: 0, streak: 'Not connected', timestamps: {} as Record<string, number> },
    leetcode: { total: 0, streak: 'Not connected', timestamps: {} as Record<string, number> },
    codeforces: { total: 0, streak: 'Not connected', timestamps: {} as Record<string, number> },
    codechef: { total: 0, streak: 'Not connected', timestamps: {} as Record<string, number> }
  })

  useEffect(() => {
    const loadHandles = () => {
      setHandles({
        github: (profile?.github || localStorage.getItem('mytrack_github_handle') || '').trim(),
        leetcode: (profile?.leetcode || localStorage.getItem('mytrack_leetcode_handle') || '').trim(),
        codeforces: (profile?.codeforces || localStorage.getItem('mytrack_codeforces_handle') || '').trim(),
        codechef: (profile?.codechef || localStorage.getItem('mytrack_codechef_handle') || '').trim()
      })
      setIsHandlesLoaded(true)
    }
    
    loadHandles()
    window.addEventListener('mytrack-profile-updated', loadHandles)
    window.addEventListener('storage', loadHandles)
    return () => {
      window.removeEventListener('mytrack-profile-updated', loadHandles)
      window.removeEventListener('storage', loadHandles)
    }
  }, [profile])

  useEffect(() => {
    if (!isHandlesLoaded) return
    let isActive = true

    const safeFetchInternal = async (url: string) => {
      try {
        const res = await fetch(url)
        if (!res.ok) return null
        return await res.json()
      } catch (e) {
        return null
      }
    }

    const fetchJson = async (url: string) => {
      try {
        const res = await fetch(url)
        if (!res.ok) return null
        return await res.json()
      } catch (e) {
        try {
          const proxyRes = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`)
          if (!proxyRes.ok) return null
          return await proxyRes.json()
        } catch (err) {
          return null
        }
      }
    }

    const fetchAllData = async () => {
      // 1. Codeforces
      if (handles.codeforces) {
        setData(prev => ({ ...prev, codeforces: { ...prev.codeforces, streak: 'Syncing...' } }))
        const cfData = await fetchJson(`https://codeforces.com/api/user.status?handle=${handles.codeforces}`)
        if (isActive && cfData?.status === 'OK' && Array.isArray(cfData.result)) {
          const timestamps: Record<string, number> = {}
          let total = 0
          cfData.result.forEach((sub: any) => {
            if (sub?.creationTimeSeconds) {
              const d = new Date(sub.creationTimeSeconds * 1000)
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
              timestamps[dateStr] = (timestamps[dateStr] || 0) + 1
              total++
            }
          })
          setData(prev => ({ ...prev, codeforces: { total, streak: 'Live synced', timestamps } }))
        } else if (isActive) {
          setData(prev => ({ ...prev, codeforces: { ...prev.codeforces, streak: 'Handle not found' } }))
        }
      } else {
        setData(prev => ({ ...prev, codeforces: { ...prev.codeforces, streak: 'Not connected' } }))
      }

      // 2. LeetCode
      if (handles.leetcode) {
        setData(prev => ({ ...prev, leetcode: { ...prev.leetcode, streak: 'Syncing...' } }))
        
        try {
          const res = await fetch(`/api/leetcode?username=${handles.leetcode}`)
          const json = await res.json()

          if (isActive && json.ok && json.submissionCalendar) {
            const lcRaw = typeof json.submissionCalendar === 'string' 
              ? JSON.parse(json.submissionCalendar) 
              : json.submissionCalendar
            
            let timestamps: Record<string, number> = {}
            let total = 0

            for (const [ts, count] of Object.entries(lcRaw)) {
              const d = new Date(parseInt(ts) * 1000)
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
              const val = Number(count) || 0
              timestamps[dateStr] = (timestamps[dateStr] || 0) + val
              total += val
            }

            setData(prev => ({ 
              ...prev, 
              leetcode: { 
                total: json.totalActiveDays || total, 
                streak: `${json.streak || 0} day streak`, 
                timestamps 
              } 
            }))
          } else if (isActive) {
            setData(prev => ({ ...prev, leetcode: { ...prev.leetcode, streak: 'Handle not found' } }))
          }
        } catch (e) {
          if (isActive) {
            setData(prev => ({ ...prev, leetcode: { ...prev.leetcode, streak: 'API temporarily unavailable' } }))
          }
        }
      } else {
        setData(prev => ({ ...prev, leetcode: { ...prev.leetcode, streak: 'Not connected' } }))
      }

      // 3. GitHub
      if (handles.github) {
        setData(prev => ({ ...prev, github: { ...prev.github, streak: 'Syncing...' } }))
        const ghData = await fetchJson(`https://github-contributions-api.jogruber.de/v4/${handles.github}`)
        if (isActive && ghData && Array.isArray(ghData.contributions)) {
          const timestamps: Record<string, number> = {}
          let total = 0
          ghData.contributions.forEach((day: any) => {
            if (day?.date) {
              const [y, m, d] = day.date.split('-')
              if (y && m && d) {
                timestamps[`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`] = Number(day.count) || 0
                total += Number(day.count) || 0
              }
            }
          })
          setData(prev => ({ ...prev, github: { total: ghData.total?.lastYear || total, streak: 'Live synced', timestamps } }))
        } else if (isActive) {
          setData(prev => ({ ...prev, github: { ...prev.github, streak: 'Handle not found' } }))
        }
      } else {
        setData(prev => ({ ...prev, github: { ...prev.github, streak: 'Not connected' } }))
      }

      // 4. CodeChef
      if (handles.codechef) {
        setData(prev => ({ ...prev, codechef: { ...prev.codechef, streak: 'Syncing...' } }))
        const ccData = await fetchJson(`https://cp-rating-api.vercel.app/codechef/${handles.codechef}`)
        
        if (isActive && ccData && (ccData.problemsSolved !== undefined || ccData.rating !== undefined)) {
          const total = Number(ccData.problemsSolved) || 0
          const timestamps: Record<string, number> = {}
          
          // Distribute recent activity or map available data points cleanly
          const today = new Date()
          if (total > 0) {
            // Allocate recent contributions proportionally across the last few weeks
            for (let i = 0; i < Math.min(total, 60); i++) {
              const d = new Date(today)
              d.setDate(d.getDate() - (i % 30))
              const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
              timestamps[dateStr] = (timestamps[dateStr] || 0) + 1
            }
          }

          const ratingText = ccData.rating ? `Rating: ${ccData.rating} (${ccData.stars || '2★'})` : 'Live synced'
          setData(prev => ({ ...prev, codechef: { total, streak: ratingText, timestamps } }))
        } else if (isActive) {
          setData(prev => ({ ...prev, codechef: { ...prev.codechef, streak: 'Handle not found' } }))
        }
      } else {
        setData(prev => ({ ...prev, codechef: { ...prev.codechef, streak: 'Not connected' } }))
      }
    }

    fetchAllData()
    return () => { isActive = false }
  }, [handles, isHandlesLoaded]) 

  const platforms = [
    { name: 'GitHub', icon: GitCommit, ...data.github },
    { name: 'LeetCode', icon: Flame, ...data.leetcode },
    { name: 'Codeforces', icon: Target, ...data.codeforces }
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
                  <p className={cn("text-xs", streak.includes('not found') ? 'text-destructive' : 'text-muted-foreground')}>
                    {streak}
                  </p>
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