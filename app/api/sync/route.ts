// app/api/sync/route.ts
import { NextResponse } from 'next/server'

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
    const todayStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    if (platform === 'github') {
      const res = await fetch(`https://api.github.com/users/${handle}/events/public`, { next: { revalidate: 60 } })
      const events = await res.json()
      // Count 'Push' events made today
      count = events.filter((e: any) => e.type === 'PushEvent' && e.created_at.startsWith(todayStr)).length
    } 
    else if (platform === 'codeforces') {
      const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=20`, { next: { revalidate: 60 } })
      const data = await res.json()
      // Count submissions with 'OK' (Accepted) verdict today
      count = data.result?.filter((sub: any) => sub.creationTimeSeconds >= startOfToday && sub.verdict === 'OK').length || 0
    } 
    else if (platform === 'leetcode') {
      // Using a popular public proxy for LeetCode API
      const res = await fetch(`https://alfa-leetcode-api.onrender.com/${handle}/acSubmission`, { next: { revalidate: 60 } })
      const data = await res.json()
      // Count accepted submissions today
      count = data.submission?.filter((sub: any) => Number(sub.timestamp) >= startOfToday).length || 0
    }

    return NextResponse.json({ count })
  } catch (error) {
    console.error(`Sync error for ${platform}:`, error)
    return NextResponse.json({ count: 0, error: 'Failed to fetch data' })
  }
}