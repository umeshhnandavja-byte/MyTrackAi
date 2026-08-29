import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ ok: false, message: 'Username is required' }, { status: 400 })
  }

  try {
    const query = `
      query userProfileCalendar($username: String!) {
        matchedUser(username: $username) {
          userCalendar {
            streak
            totalActiveDays
            submissionCalendar
          }
        }
      }
    `

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    })

    const json = await response.json()
    const calendar = json?.data?.matchedUser?.userCalendar

    if (!calendar) {
      return NextResponse.json({ ok: false, message: 'Handle not found' }, { status: 404 })
    }

    return NextResponse.json({
      ok: true,
      submissionCalendar: calendar.submissionCalendar,
      totalActiveDays: calendar.totalActiveDays,
      streak: calendar.streak,
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message || 'Failed to fetch' },
      { status: 500 }
    )
  }
}