'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function LoginModal({ isOpen }: { isOpen: boolean }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.refresh() // Refreshes the page to dismiss the modal and load user data
    
    setLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (!fullName) {
      setError('Full name is required for sign up')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    
    if (error) setError(error.message)
    else setError('Success! Check your email to continue.')
    
    setLoading(false)
  }

  return (
    <Dialog open={isOpen}>
      {/* We remove the close button so they MUST log in to use the app */}
      <DialogContent className="border-border bg-card/90 backdrop-blur-2xl sm:max-w-md [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Welcome to mytrack.</DialogTitle>
        </DialogHeader>
        
        <form className="flex flex-col gap-3 mt-4">
          {error && <div className="p-3 text-sm text-center border rounded-md bg-zinc-900 border-zinc-800 text-zinc-300">{error}</div>}

          <label className="text-sm font-medium">Full Name (New Users)</label>
          <input 
            className="px-4 py-2 text-white border rounded-md bg-zinc-900 border-zinc-800 focus:outline-none focus:border-zinc-500"
            placeholder="Jordan Davis"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <label className="text-sm font-medium">Email</label>
          <input 
            type="email"
            required
            className="px-4 py-2 text-white border rounded-md bg-zinc-900 border-zinc-800 focus:outline-none focus:border-zinc-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="text-sm font-medium">Password</label>
          <input 
            type="password"
            required
            className="px-4 py-2 text-white border rounded-md bg-zinc-900 border-zinc-800 mb-4 focus:outline-none focus:border-zinc-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={handleSignIn} disabled={loading} className="px-4 py-2 font-medium text-black transition-colors rounded-md bg-zinc-100 hover:bg-zinc-300">
            {loading ? 'Loading...' : 'Sign In'}
          </button>
          <button onClick={handleSignUp} disabled={loading} className="px-4 py-2 text-center transition-colors border rounded-md border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Sign Up
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}