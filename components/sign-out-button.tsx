'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { toast } from 'sonner'

export function SignOutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      toast.success('Signed out successfully')
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      className="w-full justify-start gap-3 text-destructive hover:text-destructive"
      onClick={handleSignOut}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      Sign Out
    </Button>
  )
}
