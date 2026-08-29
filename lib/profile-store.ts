'use client'

import { useEffect, useState } from 'react'

export type Profile = { name: string; email: string }

const defaultProfile: Profile = { name: 'Jordan Davis', email: 'jordan@example.com' }
const storageKey = 'mytrack-profile'
const profileEvent = 'mytrack-profile-updated'

export function readProfile(): Profile {
  if (typeof window === 'undefined') return defaultProfile
  try {
    const saved = window.localStorage.getItem(storageKey)
    return saved ? { ...defaultProfile, ...JSON.parse(saved) } : defaultProfile
  } catch {
    return defaultProfile
  }
}

export function saveProfile(profile: Profile) {
  window.localStorage.setItem(storageKey, JSON.stringify(profile))
  window.dispatchEvent(new Event(profileEvent))
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  useEffect(() => {
    const sync = () => setProfile(readProfile())
    sync()
    window.addEventListener(profileEvent, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(profileEvent, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  return profile
}
