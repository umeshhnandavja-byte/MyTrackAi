import { MyTrackDashboard } from '@/components/mytrack-dashboard'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAuthenticated = !!user
  const userName = user?.user_metadata?.full_name || ''

  // Notice we don't redirect anymore! We just pass the auth state down.
  return <MyTrackDashboard isAuthenticated={isAuthenticated} userName={userName} />
}