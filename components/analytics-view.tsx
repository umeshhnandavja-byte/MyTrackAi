'use client'

import { motion } from 'framer-motion'
import { useCategories } from '@/lib/category-store'
import { Activity, BarChart3, Flame, GitCommit, Target, TrendingUp } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const trend = Array.from({ length: 30 }, (_, i) => ({ day: `${i + 1}`, score: 42 + Math.round(Math.sin(i / 3) * 15 + i * 0.8) }))
const radar = [{ subject: 'Health', value: 78 }, { subject: 'Habits', value: 92 }, { subject: 'Coding', value: 68 }, { subject: 'Logic', value: 84 }, { subject: 'Planning', value: 73 }]
const heat = Array.from({ length: 182 }, (_, i) => (i % 17 === 0 ? 4 : i % 9 === 0 ? 3 : i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0))
const heatTone = ['bg-muted/60', 'bg-foreground/25', 'bg-foreground/45', 'bg-foreground/70', 'bg-foreground']

export function AnalyticsView() {
  const categories = useCategories()
  const radarData = categories.map((category) => ({ subject: category.name, value: category.value }))
  return <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8"><div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Performance systems</p><h2 className="text-3xl font-semibold tracking-tight">Analytics &amp; Stats</h2><p className="mt-2 text-sm text-muted-foreground">A clear read on your consistency, focus, and momentum.</p></div><PlatformTrends /><div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,.8fr)]"><motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-xl sm:p-6"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><Activity className="size-4" /><h3 className="font-semibold">Daily Streak Contribution Matrix</h3></div><p className="mt-1 text-sm text-muted-foreground">Your last six months of activity.</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Current streak</p><p className="text-lg font-semibold">14 days</p></div></div><div className="mt-6 grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-2" aria-label="Activity heatmap">{heat.map((level, i) => <span key={i} title={`${level} tasks`} className={`size-3 rounded-[3px] ${heatTone[level]}`} />)}</div><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>Total tasks completed <strong className="text-foreground">342</strong></span><span className="flex items-center gap-1">Less <span className="size-2 rounded-sm bg-muted/60" /><span className="size-2 rounded-sm bg-foreground/45" /><span className="size-2 rounded-sm bg-foreground" /> More</span></div></motion.section><motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-xl sm:p-6"><div className="flex items-center gap-2"><Target className="size-4" /><h3 className="font-semibold">Life RPG Stats</h3></div><p className="mt-1 text-sm text-muted-foreground">Focus distribution by region.</p><div className="mt-4 h-56"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData}><PolarGrid stroke="oklch(1 0 0 / .14)" /><PolarAngleAxis dataKey="subject" tick={{ fill: 'oklch(.65 0 0)', fontSize: 10 }} /><Radar dataKey="value" stroke="oklch(.9 0 0)" fill="oklch(.9 0 0)" fillOpacity={.18} /></RadarChart></ResponsiveContainer></div></motion.section></div><motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 }} className="mt-6 rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-xl sm:p-6"><div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><TrendingUp className="size-4" /><h3 className="font-semibold">Task Consistency Over Time</h3></div><p className="mt-1 text-sm text-muted-foreground">Completion quality across the last 30 days.</p></div><span className="flex items-center gap-2 text-sm text-muted-foreground"><Flame className="size-4" /> +18% this month</span></div><div className="mt-6 h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><defs><linearGradient id="consistency-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(.9 0 0)" stopOpacity={.24} /><stop offset="100%" stopColor="oklch(.9 0 0)" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="oklch(1 0 0 / .08)" /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: 'oklch(.55 0 0)', fontSize: 11 }} /><YAxis hide domain={[0, 100]} /><Tooltip contentStyle={{ background: 'oklch(.13 0 0)', border: '1px solid oklch(1 0 0 / .15)', borderRadius: 10, color: 'oklch(.94 0 0)' }} /><Area type="monotone" dataKey="score" stroke="oklch(.94 0 0)" strokeWidth={2} fill="url(#consistency-fill)" /></AreaChart></ResponsiveContainer></div></motion.section></main>
}

const platformTrends = [
  { name: 'GitHub', icon: GitCommit, total: 86, streak: '12 day streak', seed: 3 },
  { name: 'LeetCode', icon: Flame, total: 64, streak: '8 day streak', seed: 7 },
  { name: 'Codeforces', icon: Target, total: 42, streak: '5 day streak', seed: 11 },
  { name: 'CodeChef', icon: BarChart3, total: 31, streak: '3 day streak', seed: 17 },
]

function PlatformContributionGrid({ seed }: { seed: number }) {
  const levels = Array.from({ length: 365 }, (_, index) => {
    const value = (index * 7 + seed * 11) % 13
    return value > 10 ? 4 : value > 7 ? 3 : value > 4 ? 2 : value > 1 ? 1 : 0
  })
  return <div className="grid auto-cols-max grid-flow-col grid-rows-7 gap-1 overflow-x-auto" aria-label="Platform contribution trend">{levels.map((level, index) => <span key={index} title={`${level} contributions`} className={`size-2.5 rounded-[2px] ${heatTone[level]}`} />)}</div>
}

export function PlatformTrends() {
  return <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-2xl border border-border bg-card/50 p-5 backdrop-blur-xl sm:p-6"><div className="flex items-end justify-between gap-4"><div><div className="flex items-center gap-2"><TrendingUp className="size-4" /><h3 className="font-semibold">Platform contribution trends</h3></div><p className="mt-1 text-sm text-muted-foreground">GitHub-style activity across your coding platforms.</p></div><span className="text-xs text-muted-foreground">Last 365 days</span></div><div className="mt-5 grid gap-3 md:grid-cols-2">{platformTrends.map(({ name, icon: Icon, total, streak, seed }) => <div key={name} className="rounded-xl border border-border/70 bg-background/35 p-4"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2"><span className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted/30"><Icon className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-medium">{name}</p><p className="text-xs text-muted-foreground">{streak}</p></div></div><p className="text-sm font-semibold">{total}<span className="ml-1 text-xs font-normal text-muted-foreground">contributions</span></p></div><div className="mt-4"><PlatformContributionGrid seed={seed} /></div><div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground"><span>365 days ago</span><span className="flex items-center gap-1">Less <i className="size-2 rounded-[2px] bg-muted/60" /><i className="size-2 rounded-[2px] bg-foreground/45" /><i className="size-2 rounded-[2px] bg-foreground" /> More</span><span>Today</span></div></div>)}</div></motion.section>
}

export const AnalyticsPage = AnalyticsView
void BarChart3
void GitCommit
