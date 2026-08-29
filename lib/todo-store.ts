'use client'

import { useSyncExternalStore } from 'react'
import { createClient } from '@/lib/supabase/client'

export type TodoItem = { 
  id: number | string
  title: string
  priority: 'Urgent' | 'Medium' | 'Low'
  due: string
  done: boolean 
}

const STORAGE_KEY = 'mytrack_local_todos'

// 1. Start by attempting to load from local storage
let todos: TodoItem[] = typeof window !== 'undefined' 
  ? JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') 
  : []

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

// Helper to save locally
function saveLocal() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }
}

const emptyTodos: TodoItem[] = []

export function useTodos() { 
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener) }, 
    () => todos, 
    () => emptyTodos
  ) 
}

export async function addTodo(title: string, priority: TodoItem['priority'] = 'Medium', due = 'No date') { 
  if (!title.trim()) return

  // 2. Save locally FIRST (Optimistic & Offline-ready)
  const newId = Date.now().toString() // Temporary ID
  todos = [...todos, { id: newId, title: title.trim(), priority, due, done: false }]
  saveLocal()
  notify()

  // 3. Try to save to Supabase
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return // If not logged in, we stop here. The local save is enough!

  const { data, error } = await supabase
    .from('Todo')
    .insert({ title: title.trim(), priority, due, done: false, user_id: user.id })
    .select()
    .single()

  // 4. Swap temporary local ID with real database ID
  if (data && !error) {
    todos = todos.map(t => t.id === newId ? { 
      id: data.id, title: data.title, priority: data.priority, due: data.due, done: data.done 
    } : t)
    saveLocal()
    notify()
  }
}

export async function setTodoDone(id: number | string, done: boolean) { 
  todos = todos.map((todo) => todo.id === id ? { ...todo, done } : todo)
  saveLocal()
  notify()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) await supabase.from('Todo').update({ done }).eq('id', id)
}

export async function removeTodo(id: number | string) { 
  todos = todos.filter((todo) => todo.id !== id)
  saveLocal()
  notify()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) await supabase.from('Todo').delete().eq('id', id)
}

// 5. The Magic Migration Function
export async function loadTodos() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // If not logged in, just ensure we are showing local storage data
    todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    notify()
    return
  }

  // --- MIGRATION: Push local items to the cloud ---
  const localTodos: TodoItem[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  
  // If they have local to-dos that haven't been saved to the DB yet (using temporary timestamp IDs)
  const unsyncedTodos = localTodos.filter(t => typeof t.id === 'string' && !t.id.includes('-')) 
  
  if (unsyncedTodos.length > 0) {
    const todosToInsert = unsyncedTodos.map(t => ({
      title: t.title, priority: t.priority, due: t.due, done: t.done, user_id: user.id
    }))
    await supabase.from('Todo').insert(todosToInsert)
    localStorage.removeItem(STORAGE_KEY) // Clear local storage once migrated!
  }
  // ------------------------------------------------

  // Finally, fetch the true cloud data
  const { data, error } = await supabase.from('Todo').select('*').order('created_at', { ascending: true })

  if (data && !error) {
    todos = data.map((dbTodo) => ({
      id: dbTodo.id,
      title: dbTodo.title,
      priority: dbTodo.priority as 'Urgent' | 'Medium' | 'Low',
      due: dbTodo.due,
      done: dbTodo.done,
    }))
    saveLocal() // Keep local cache in sync with cloud
    notify() 
  }
}