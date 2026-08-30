'use client'

import { useSyncExternalStore } from 'react'
import { createClient } from '@/lib/supabase/client'
import { removeCategory } from './category-store'

export type TrackTask = {
  id: string | number
  name: string
  program: string
  cadence: string
  days?: string[]
  streak: number
  completed: boolean
  lastCompletedAt?: string | null 
  // --- Auto-Sync Fields ---
  tracking?: string
  platform?: string
  handle?: string
  goal?: number
}

const STORAGE_KEY = 'mytrack_local_tasks'

// 1. THE MAGIC FUNCTION: Checks if the task is done for its current cycle!
function checkIsCompleted(cadence: string, lastCompletedAt?: string | null): boolean {
  if (!lastCompletedAt) return false;

  const last = new Date(lastCompletedAt);
  const now = new Date();

  if (cadence === 'Daily' || cadence === 'Weekly') {
    // Must be completed exactly today
    return last.toDateString() === now.toDateString();
  }
  if (cadence === 'Monthly') {
    // Must be completed in the current month AND year
    return last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear();
  }
  if (cadence === 'Yearly') {
    // Must be completed in the current year
    return last.getFullYear() === now.getFullYear();
  }
  return false;
}

// 2. Initialize from local storage, but auto-reset if a new day/month started!
let tasks: TrackTask[] = []
if (typeof window !== 'undefined') {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  tasks = stored.map((t: TrackTask) => ({
    ...t,
    completed: checkIsCompleted(t.cadence, t.lastCompletedAt)
  }))
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

function saveLocal() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }
}

const emptyTasks: TrackTask[] = []

export function useTasks() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    () => tasks,
    () => emptyTasks 
  )
}

export async function setTaskCompleted(id: number | string, completed: boolean) {
  const nowIso = completed ? new Date().toISOString() : null;
  const todayStr = new Date().toDateString();

  tasks = tasks.map((task) => {
    if (task.id !== id) return task;

    // Check if it was already completed earlier today
    const wasCompletedToday = task.lastCompletedAt 
      ? new Date(task.lastCompletedAt).toDateString() === todayStr 
      : false;

    let newStreak = task.streak;
    if (completed && !wasCompletedToday) {
      newStreak += 1; // Increment streak only once per day
    } else if (!completed && wasCompletedToday && newStreak > 0) {
      newStreak -= 1; // Roll back if unchecked
    }

    return { 
      ...task, 
      completed,
      streak: newStreak,
      lastCompletedAt: nowIso 
    };
  });
  
  saveLocal();
  notify();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    const updatedTask = tasks.find(t => t.id === id);
    if (updatedTask) {
      await supabase
        .from('Task')
        .update({ 
          lastCompletedAt: nowIso,
          currentStreak: updatedTask.streak 
        })
        .eq('id', id);
    }
  }
}

export async function addTask(taskData: Omit<TrackTask, 'id' | 'completed' | 'lastCompletedAt'>) {
  const newId = Date.now().toString()
  const newTask: TrackTask = {
    id: newId,
    ...taskData,
    completed: false,
    lastCompletedAt: null
  }
  
  tasks = [...tasks, newTask]
  saveLocal()
  notify()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 

  const { data, error } = await supabase
    .from('Task')
    .insert({
      title: taskData.name,
      category: taskData.program,
      frequency: taskData.cadence,
      days: taskData.days || null,
      currentStreak: taskData.streak,
      user_id: user.id,
      // Pass the new Auto-Sync data to Supabase
      tracking: taskData.tracking || 'manual',
      platform: taskData.platform || null,
      handle: taskData.handle || null,
      goal: taskData.goal || null
    })
    .select()
    .single()

  if (data && !error) {
    tasks = tasks.map((t) => t.id === newId ? { 
      id: data.id, 
      name: data.title, 
      program: data.category, 
      cadence: data.frequency, 
      days: data.days || [],
      streak: data.currentStreak, 
      completed: t.completed,
      lastCompletedAt: t.lastCompletedAt,
      // Map returned Sync data back to state
      tracking: data.tracking,
      platform: data.platform,
      handle: data.handle,
      goal: data.goal
    } : t)
    saveLocal()
    notify()
  }
}

export async function removeTask(id: number | string) {
  tasks = tasks.filter((task) => task.id !== id)
  saveLocal()
  notify()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    await supabase.from('Task').delete().eq('id', id)
  }
}

export async function loadTasks() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Make sure we re-evaluate completion even if they are offline
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    tasks = stored.map((t: TrackTask) => ({
      ...t,
      completed: checkIsCompleted(t.cadence, t.lastCompletedAt)
    }))
    notify()
    return
  }

  const localTasks: TrackTask[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const unsyncedTasks = localTasks.filter(t => typeof t.id === 'string' && !t.id.includes('-'))

  if (unsyncedTasks.length > 0) {
    const tasksToInsert = unsyncedTasks.map(t => ({
      title: t.name,
      category: t.program,
      frequency: t.cadence,
      days: t.days || null,
      currentStreak: t.streak,
      user_id: user.id,
      lastCompletedAt: t.lastCompletedAt || null,
      // Migrate offline sync data to cloud
      tracking: t.tracking || 'manual',
      platform: t.platform || null,
      handle: t.handle || null,
      goal: t.goal || null
    }))
    
    await supabase.from('Task').insert(tasksToInsert)
    localStorage.removeItem(STORAGE_KEY) 
  }

  const { data, error } = await supabase
    .from('Task')
    .select('*')
    .order('created_at', { ascending: true })

  if (data && !error) {
    tasks = data.map((dbTask) => ({
      id: dbTask.id,
      name: dbTask.title,
      program: dbTask.category,
      cadence: dbTask.frequency,
      days: dbTask.days || [],
      streak: dbTask.currentStreak,
      lastCompletedAt: dbTask.lastCompletedAt,
      // Load Auto-Sync stats from database
      tracking: dbTask.tracking,
      platform: dbTask.platform,
      handle: dbTask.handle,
      goal: dbTask.goal,
      completed: checkIsCompleted(dbTask.frequency, dbTask.lastCompletedAt),
    }))
    saveLocal() 
    notify() 
  }
}

export async function removeCategoryAndTasks(categoryName: string, categoryId: string) {
  await removeCategory(categoryId)

  tasks = tasks.filter(task => task.program?.toLowerCase() !== categoryName.toLowerCase())
  saveLocal()
  notify()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase
      .from('Task')
      .delete()
      .eq('user_id', user.id)
      .ilike('category', categoryName) // Assuming category logic was updated here per your db schema
  }
}

// ---------------------------------------------------
// NEW: AUTO-SYNC FUNCTION
// ---------------------------------------------------
export async function runAutoSync() {
  // Find all incomplete tasks that have Auto-Sync enabled
  const autoTasks = tasks.filter(t => t.tracking === 'auto' && !t.completed && t.platform && t.handle)

  if (autoTasks.length === 0) return

  for (const task of autoTasks) {
    try {
      const res = await fetch(`/api/sync?platform=${task.platform}&handle=${task.handle}`)
      const data = await res.json()
      
      // If their submissions today meet or exceed the goal, complete the task automatically!
      if (data.count >= (task.goal || 1)) {
        await setTaskCompleted(task.id, true)
      }
    } catch (err) {
      console.error(`Auto-sync failed for task: ${task.name}`, err)
    }
  }
}