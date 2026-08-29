'use client'

import { useSyncExternalStore } from 'react'

export type TrackTask = {
  id: number
  name: string
  program: string
  cadence: string
  streak: number
  completed: boolean
}

const initialTasks: TrackTask[] = [
  { id: 1, name: 'Complete morning workout', program: 'Health', cadence: 'Daily', streak: 12, completed: false },
  { id: 2, name: 'Solve 2 algorithm problems', program: 'Logic / CP', cadence: 'Daily', streak: 8, completed: false },
  { id: 3, name: 'Ship the dashboard component', program: 'Software Dev', cadence: 'Weekly', streak: 21, completed: false },
  { id: 4, name: "Plan tomorrow's priorities", program: 'Planning', cadence: 'Daily', streak: 3, completed: false },
  { id: 5, name: 'Review one system design concept', program: 'Software Dev', cadence: 'Weekly', streak: 6, completed: false },
  { id: 6, name: 'Complete a CodeSync challenge', program: 'Logic / CP', cadence: 'Daily', streak: 4, completed: false },
]

let tasks = initialTasks
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

export function useTasks() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    () => tasks,
    () => initialTasks,
  )
}

export function setTaskCompleted(id: number, completed: boolean) {
  tasks = tasks.map((task) => task.id === id ? { ...task, completed } : task)
  notify()
}

export function addTask(task: Omit<TrackTask, 'id' | 'completed'>) {
  tasks = [...tasks, { ...task, id: Date.now(), completed: false }]
  notify()
}

export function removeTask(id: number) {
  tasks = tasks.filter((task) => task.id !== id)
  notify()
}
