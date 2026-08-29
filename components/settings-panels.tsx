'use client'

import { useState, useEffect } from 'react'
import { UserRound, Plug, Tag, Plus, Trash2, Heart, Repeat2, Code2, Brain, Target, Dumbbell, ImagePlus, GitCommit, Flame, Save, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { addCategory, removeCategory, updateCategory, useCategories } from '@/lib/category-store'
import { saveProfile, useProfile } from '@/lib/profile-store'
import { removeCategoryAndTasks } from '@/lib/task-store'

const tabs = [['Profile', UserRound], ['Platform Integrations', Plug], ['Categories', Tag]] as const

export function SettingsPanels() {
  const [tab, setTab] = useState('Profile')
  
  // Unified Profile & Integrations State
  const profile = useProfile()
  const [profileDraft, setProfileDraft] = useState(profile)
  const [savedStatus, setSavedStatus] = useState(false)
  
  // Keep profileDraft synchronized whenever the profile store updates from Supabase/localStorage
  useEffect(() => {
    if (profile) {
      setProfileDraft(profile)
    }
  }, [profile])

  const handleSaveAll = () => {
    // Save everything (Profile info + Platform handles) through your profile store
    saveProfile(profileDraft)
    
    // Fallback sync for legacy local keys
    if (profileDraft.github) localStorage.setItem('mytrack_github_handle', profileDraft.github)
    if (profileDraft.leetcode) localStorage.setItem('mytrack_leetcode_handle', profileDraft.leetcode)
    if (profileDraft.codeforces) localStorage.setItem('mytrack_codeforces_handle', profileDraft.codeforces)

    window.dispatchEvent(new Event('handles_updated'))
    setSavedStatus(true)
    setTimeout(() => setSavedStatus(false), 2000)
  }
  
  // Category State
  const [draftCategory, setDraftCategory] = useState('')
  const categories = useCategories()
  const [uploading, setUploading] = useState<string | null>(null)
  const baseImages = [
    { name: 'heart', Icon: Heart }, 
    { name: 'repeat', Icon: Repeat2 }, 
    { name: 'code', Icon: Code2 }, 
    { name: 'brain', Icon: Brain }, 
    { name: 'target', Icon: Target }, 
    { name: 'dumbbell', Icon: Dumbbell }
  ]

  const uploadImage = async (categoryId: string, file: File) => { 
    setUploading(categoryId)
    const body = new FormData()
    body.append('file', file)
    const response = await fetch('/api/category-image', { method: 'POST', body })
    const result = await response.json()
    if (response.ok) updateCategory(categoryId, { imageUrl: `/api/category-image?pathname=${encodeURIComponent(result.pathname)}` })
    setUploading(null) 
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
        <h2 className="text-3xl font-semibold tracking-tight">Settings</h2>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-[13rem_1fr]">
        <nav className="flex gap-1 overflow-auto lg:flex-col">
          {tabs.map(([label, Icon]) => (
            <button 
              key={label} 
              onClick={() => setTab(label)} 
              className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground whitespace-nowrap lg:whitespace-normal', tab === label && 'bg-accent text-foreground')}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <section className="max-w-2xl rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-xl">
          <h3 className="font-semibold">{tab}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === 'Profile' ? 'Manage your personal workspace identity.' : 
             tab === 'Platform Integrations' ? 'Connect the tools that power your tracked tasks.' : 
             'Manage your focus areas and display visuals.'}
          </p>
          
          <div className="mt-6 flex flex-col gap-6">
            
            {/* PROFILE TAB */}
            {tab === 'Profile' && (
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Full name
                  <input 
                    aria-label="Profile name" 
                    value={profileDraft?.name || ''} 
                    onChange={(event) => setProfileDraft({ ...profileDraft, name: event.target.value })} 
                    placeholder="Enter your full name"
                    className="h-10 rounded-lg border border-input bg-background px-3 font-normal text-foreground" 
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Email address
                  <input 
                    aria-label="Profile email" 
                    type="email" 
                    value={profileDraft?.email || ''} 
                    onChange={(event) => setProfileDraft({ ...profileDraft, email: event.target.value })} 
                    placeholder="Enter your email"
                    className="h-10 rounded-lg border border-input bg-background px-3 font-normal text-foreground" 
                  />
                </label>
                <div className="flex items-center gap-3 mt-2">
                  <Button onClick={handleSaveAll}>Save profile</Button>
                  {savedStatus && <span className="text-sm font-medium text-emerald-500">Saved successfully!</span>}
                </div>
              </div>
            )}

            {/* PLATFORM INTEGRATIONS TAB */}
            {tab === 'Platform Integrations' && (
              <div className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><GitCommit className="size-4" /> GitHub Username</label>
                    <input 
                      value={profileDraft?.github || ''} 
                      onChange={(e) => setProfileDraft({ ...profileDraft, github: e.target.value })} 
                      placeholder="e.g. torvalds" 
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all text-foreground" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Flame className="size-4" /> LeetCode Handle</label>
                    <input 
                      value={profileDraft?.leetcode || ''} 
                      onChange={(e) => setProfileDraft({ ...profileDraft, leetcode: e.target.value })} 
                      placeholder="e.g. striver_79" 
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all text-foreground" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Target className="size-4" /> Codeforces Handle</label>
                    <input 
                      value={profileDraft?.codeforces || ''} 
                      onChange={(e) => setProfileDraft({ ...profileDraft, codeforces: e.target.value })} 
                      placeholder="e.g. tourist" 
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground transition-all text-foreground" 
                    />
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-start border-t border-border/50 pt-5">
                  <Button onClick={handleSaveAll} className="gap-2 transition-all">
                    {savedStatus ? <><CheckCircle2 className="size-4" /> Saved Successfully</> : <><Save className="size-4" /> Save Integrations</>}
                  </Button>
                </div>
              </div>
            )}

            {/* CATEGORIES TAB */}
            {tab === 'Categories' && (
              <>
                <div className="flex gap-2">
                  <input aria-label="New category" value={draftCategory} onChange={(event) => setDraftCategory(event.target.value)} placeholder="Add a category" className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 text-sm text-foreground" />
                  <Button onClick={() => { addCategory(draftCategory); setDraftCategory('') }}><Plus data-icon="inline-start" />Add</Button>
                </div>
                <div className="flex flex-col gap-2 mt-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">{category.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${category.name}`} onClick={() => removeCategoryAndTasks(category.name, category.id)}><Trash2 className="size-4" /></Button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {baseImages.map(({ name, Icon }) => (
                          <button key={name} type="button" aria-label={`Use ${name} image`} onClick={() => updateCategory(category.id, { image: name, imageUrl: undefined })} className={cn('flex size-9 items-center justify-center rounded-lg border border-border', category.image === name && 'border-foreground bg-accent')}><Icon className="size-4" /></button>
                        ))}
                        <label className="flex size-9 cursor-pointer items-center justify-center rounded-lg border border-dashed border-border hover:bg-accent/50 transition-colors" title="Import image">
                          <ImagePlus className="size-4 text-muted-foreground" />
                          <input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(category.id, file) }} />
                        </label>
                        {uploading === category.id && <span className="self-center text-xs text-muted-foreground animate-pulse">Uploading…</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}