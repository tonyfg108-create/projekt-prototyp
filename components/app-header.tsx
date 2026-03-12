'use client'

import Link from 'next/link'
import { Bell, Coins, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from './auth-provider'

export function AppHeader() {
  const { user, profile } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-primary" />
          </div>
          <span className="font-semibold text-lg hidden sm:block">Good Deeds</span>
        </Link>

        <div className="flex items-center gap-3">
          {user && profile && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
                <Coins className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {profile.total_tokens.toLocaleString()}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
            </>
          )}
          {!user && (
            <Button asChild size="sm">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
