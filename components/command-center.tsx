'use client'

import { useState } from 'react'
import { addTask } from '@/lib/task-store'
import { addTodo } from '@/lib/todo-store'
import { addCategory, useCategories } from '@/lib/category-store' // Adjust import based on your store setup
import { Button } from '@/components/ui/button'

export function CommandCenter() {
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; text: string }>>([
    { role: 'assistant', text: 'Hey! Ask me for platform guidance, chat normally, or tell me a task or to-do you want to add.' }
  ])
  const [draft, setDraft] = useState<{ type: 'TASK' | 'TODO'; data: any; category?: any } | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  // Grab existing categories to check if it already exists
  const { categories } = useCategories ? useCategories() : { categories: [] }

  async function handleSend() {
    if (!prompt.trim() || loading) return

    const userText = prompt.trim()
    const updatedMessages = [...messages, { role: 'user' as const, text: userText }]
    setMessages(updatedMessages)
    setPrompt('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      })
      const data = await res.json()

      setMessages([
        ...updatedMessages,
        { role: 'assistant', text: data.text }
      ])

      if (data.action) {
        setDraft(data.action)
        setSaved(false)
      }
    } catch (err) {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', text: "Sorry, I ran into an error connecting to the AI backend." }
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveDraft() {
    if (!draft || !draft.data) return

    if (draft.type === 'TASK') {
      addTask(draft.data)
      const programName = draft.data.program || 'General'
      const categoryExists = categories?.some(
        (c: any) => c.name.toLowerCase() === programName.toLowerCase()
      )
      if (!categoryExists) {
        try {
          await addCategory(programName)
        } catch (e) {
          console.error("Failed to register category:", e)
        }
      }
    } else if (draft.type === 'TODO') {
      // Pass title, priority, and due as positional arguments matching your todo-store
      await addTodo(
        draft.data.title || draft.data.name, 
        draft.data.priority || 'Medium', 
        draft.data.due || 'No date'
      )
    }
    
    setSaved(true)
  }
  return (
    <div className="flex flex-col gap-4">
      {/* Chat History Container */}
      <div className="flex max-h-[220px] flex-col gap-2 overflow-y-auto pr-1">
        {messages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`rounded-xl px-3 py-2 text-xs max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start">
            <div className="rounded-xl px-3 py-2 text-xs bg-muted text-muted-foreground animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div className="flex gap-2">
        <input 
          autoFocus 
          value={prompt} 
          onChange={(event) => setPrompt(event.target.value)} 
          onKeyDown={(event) => { 
            if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) {
              handleSend()
            } 
          }} 
          placeholder="Say hi, ask for help, or add a task/todo..." 
          aria-label="AI assistant prompt" 
          className="h-10 min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-foreground" 
        />
        <Button onClick={handleSend} disabled={loading}>Send</Button>
      </div>

      {/* Draft Card Preview */}
      {draft && draft.data && (
        <div className="rounded-xl border border-border bg-background/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {draft.type === 'TASK' ? 'Task draft' : 'To-Do draft'}
          </p>
          <p className="mt-2 font-medium text-foreground">
            {draft.type === 'TASK' ? (draft.data.name || 'Untitled task') : (draft.data.title || 'Untitled to-do')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {draft.type === 'TASK' 
              ? `Category: ${draft.data.program || 'General'} · ${draft.data.cadence || 'Daily'}` 
              : 'To-Do List · Ready for review'}
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSaveDraft}>
              {draft.type === 'TASK' ? 'Add task & category' : 'Add to-do'}
            </Button>
            <Button variant="outline" onClick={() => setDraft(null)}>Discard</Button>
          </div>
          {saved && <p className="mt-2 text-xs text-muted-foreground">Successfully added to your dashboard and categories!</p>}
        </div>
      )}
    </div>
  )
}