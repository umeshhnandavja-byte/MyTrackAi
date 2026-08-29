'use client'

import { useSyncExternalStore } from 'react'

export type TodoItem = { id: number; title: string; priority: 'Urgent' | 'Medium' | 'Low'; due: string; done: boolean }

let todos: TodoItem[] = [
  { id: 1, title: 'Review project proposal', priority: 'Urgent', due: 'Today, 4:30 PM', done: false },
  { id: 2, title: 'Book dentist appointment', priority: 'Medium', due: 'Tomorrow, 5:00 PM', done: false },
  { id: 3, title: 'Organize design references', priority: 'Low', due: 'Friday, 9:00 AM', done: false },
  { id: 4, title: 'Prepare weekly progress update', priority: 'Medium', due: 'Friday, 12:00 PM', done: false },
]
const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())
export function useTodos() { return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener) }, () => todos, () => todos) }
export function addTodo(title: string, priority: TodoItem['priority'] = 'Medium', due = 'No date') { if (!title.trim()) return; todos = [...todos, { id: Date.now(), title: title.trim(), priority, due: due || 'No date', done: false }]; notify() }
export function setTodoDone(id: number, done: boolean) { todos = todos.map((todo) => todo.id === id ? { ...todo, done } : todo); notify() }
export function removeTodo(id: number) { todos = todos.filter((todo) => todo.id !== id); notify() }
