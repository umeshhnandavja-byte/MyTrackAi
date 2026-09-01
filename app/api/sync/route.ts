// app/api/sync/route.ts
import { NextResponse } from 'next/server'

// 1. Forces Vercel to always run the code (no stale data)
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform')
  const handle = searchParams.get('handle')

  if (!platform || !handle) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  let count = 0

  try {
    const startOfToday = new Date().setHours(0, 0, 0, 0) / 1000 // Today midnight in seconds
    const todayStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD in UTC

    if (platform === 'github') {
      const res = await fetch(`https://api.github.com/users/${handle}/events/public`, { cache: 'no-store' })
      const events = await res.json()
      
      if (Array.isArray(events)) {
        count = events.filter((e: any) => e.type === 'PushEvent' && e.created_at.startsWith(todayStr)).length
      } else {
        console.error("GitHub API did not return an array:", events)
      }
    } 
    else if (platform === 'codeforces') {
      const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=20`, { cache: 'no-store' })
      const data = await res.json()
      count = data.result?.filter((sub: any) => sub.creationTimeSeconds >= startOfToday && sub.verdict === 'OK').length || 0
    } 
    else if (platform === 'leetcode') {
      // Keeping your proxy for the Analytics page!
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/${handle}/acSubmission`, { cache: 'no-store' })
      const data = await res.json()
      count = data.submission?.filter((sub: any) => Number(sub.timestamp) >= startOfToday).length || 0
    }

    return NextResponse.json({ count })
  } catch (error) {
    console.error(`Sync error for ${platform}:`, error)
    return NextResponse.json({ count: 0, error: 'Failed to fetch data' })
  }
}