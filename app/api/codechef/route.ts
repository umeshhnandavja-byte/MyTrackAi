import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ ok: false, message: 'Username is required' }, { status: 400 })
  }

  try {
    // Try multiple public mirrors sequentially from the server
    const endpoints = [
      `https://codechef-api.vercel.app/handle/${username}`,
      `https://cp-rating-api.vercel.app/codechef/${username}`
    ]

    let data = null
    for (const url of endpoints) {
      try {
        const res = await fetch(url)
        if (res.ok) {
          const json = await res.json()
          if (json && (json.heatMap || json.problemsSolved)) {
            data = json
            break
          }
        }
      } catch (e) {
        continue
      }
    }

    if (!data) {
      return NextResponse.json({ ok: false, message: 'API temporarily unavailable' }, { status: 503 })
    }

    return NextResponse.json({
      ok: true,
      heatMap: data.heatMap || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message || 'Failed to fetch' },
      { status: 500 }
    )
  }
}