import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { messages } = await request.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        text: "Groq API key missing in environment variables.", 
        action: null 
      }, { status: 500 })
    }

    const systemPrompt = `You are MyTrack AI, a helpful productivity assistant built into the MyTrack platform.
1. Have normal, friendly conversations and help users navigate the app.
2. If the user asks to add a routine task or habit, output a CREATE_TASK JSON block at the very end.
3. If the user asks to add a one-off item, errand, or item to their to-do list, output a CREATE_TODO JSON block at the very end.

For tasks:
\`\`\`json
{
  "action": "CREATE_TASK",
  "task": {
    "name": "Task Name Here",
    "cadence": "Daily",
    "program": "General",
    "streak": 0
  }
}
\`\`\`

For to-dos:
\`\`\`json
{
  "action": "CREATE_TODO",
  "todo": {
    "title": "Todo Title Here",
    "done": false
  }
}
\`\`\`
If no task or to-do is requested, do not output any json block.`

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text
      }))
    ]

    const apiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: formattedMessages,
        temperature: 0.2,
      })
    })

    const data = await apiRes.json()
    const rawText = data?.choices?.[0]?.message?.content || "Received empty content response from Groq."

    let aiResponseText = rawText
    let actionData = null

    const jsonMatch = rawText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/) || rawText.match(/(\{[\s\S]*?"action"\s*:\s*"(?:CREATE_TASK|CREATE_TODO)"[\s\S]*?\})/)
    
    if (jsonMatch) {
      try {
        const parsedJson = JSON.parse(jsonMatch[1])
        if (parsedJson.action === 'CREATE_TASK' && (parsedJson.task || parsedJson.data)) {
          const taskData = parsedJson.task || parsedJson.data
          if (!taskData.program) taskData.program = 'General'
          actionData = { type: 'TASK', data: taskData }
        } else if (parsedJson.action === 'CREATE_TODO' && (parsedJson.todo || parsedJson.data)) {
          actionData = { type: 'TODO', data: parsedJson.todo || parsedJson.data }
        }
      } catch (e) {
        console.error("JSON Parse Error:", e)
      }
      aiResponseText = rawText.replace(/```[\s\S]*?```/g, '').trim()
    }

    return NextResponse.json({ text: aiResponseText, action: actionData })
  } catch (error: any) {
    return NextResponse.json({ 
      text: "Server exception handling AI route.", 
      action: null 
    }, { status: 500 })
  }
}