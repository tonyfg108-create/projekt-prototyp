'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, ListTodo, Trophy, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from './auth-provider'

const navItems = [
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/tasks', icon: ListTodo, label: 'Tasks' },
  { href: '/submit', icon: Plus, label: 'Submit', featured: true },
  { href: '/leaderboard', icon: Trophy, label: 'Leaders' },
  { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon
          
          // If not logged in, redirect profile to login
          const href = !user && item.href === '/profile' ? '/auth/login' : item.href
          
          if (item.featured) {
            return (
              <Link
                key={item.href}
                href={user ? href : '/auth/login'}
                className="flex flex-col items-center justify-center -mt-4"
              >
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 transition-transform hover:scale-105 active:scale-95">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-[10px] mt-1 text-muted-foreground">
                  {item.label}
                </span>
              </Link>
            )
          }
          
          return (
            <Link
              key={item.href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'stroke-[2.5]')} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
