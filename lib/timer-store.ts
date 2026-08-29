'use client'

import { useSyncExternalStore } from 'react'

type TimerState = {
  duration: number
  timeLeft: number
  isRunning: boolean
  mode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom'
}

let state: TimerState = {
  duration: 25 * 60,
  timeLeft: 25 * 60,
  isRunning: false,
  mode: 'pomodoro'
}

const listeners = new Set<() => void>()
const notify = () => listeners.forEach((listener) => listener())

// Request notification permission on load
if (typeof window !== 'undefined' && 'Notification' in window) {
  if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
    Notification.requestPermission()
  }
}

function playAlarmSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime)
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.start()
    oscillator.stop(audioCtx.currentTime + 0.8)
  } catch {
    // Fallback
  }
}

// Global background ticker (Runs 24/7 in memory as long as the app is open)
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (state.isRunning && state.timeLeft > 0) {
      state = { ...state, timeLeft: state.timeLeft - 1 }
      notify()
    } else if (state.isRunning && state.timeLeft === 0) {
      state = { ...state, isRunning: false }
      notify()
      playAlarmSound()

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Timer Complete!', {
          body: 'Your focus session or break has finished. Great job!',
          icon: '/favicon.ico'
        })
      }
    }
  }, 1000)
}

export function useGlobalTimer() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => listeners.delete(listener) },
    () => state,
    () => state
  )
}

export function setTimerMode(mode: 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom', customMinutes?: number) {
  let secs = 25 * 60
  if (mode === 'shortBreak') secs = 5 * 60
  if (mode === 'longBreak') secs = 15 * 60
  if (mode === 'custom' && customMinutes) secs = customMinutes * 60

  state = {
    duration: secs,
    timeLeft: secs,
    isRunning: mode === 'custom',
    mode
  }
  notify()
}

export function toggleTimerRun() {
  state = { ...state, isRunning: !state.isRunning }
  notify()
}

export function resetTimerState() {
  state = { ...state, isRunning: false, timeLeft: state.duration }
  notify()
}

export function setTimerDuration(secs: number) {
  state = { ...state, duration: secs, timeLeft: secs, isRunning: true }
  notify()
}