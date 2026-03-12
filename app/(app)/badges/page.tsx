import { createClient } from '@/lib/supabase/server'
import { Award, Lock, CheckCircle } from 'lucide-react'
import type { Badge, UserBadge } from '@/lib/types'

async function getAllBadges() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('badges')
    .select('*')
    .order('requirement_value', { ascending: true })
  
  return (data || []) as Badge[]
}

async function getUserBadges(userId: string | null) {
  if (!userId) return []
  
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)
  
  return (data || []).map(ub => ub.badge_id)
}

export default async function BadgesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const [badges, earnedBadgeIds] = await Promise.all([
    getAllBadges(),
    getUserBadges(user?.id || null),
  ])

  const earnedCount = earnedBadgeIds.length
  const totalCount = badges.length

  // Group badges by category
  const groupedBadges = badges.reduce((acc, badge) => {
    const cat = badge.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(badge)
    return acc
  }, {} as Record<string, Badge[]>)

  const categoryLabels: Record<string, string> = {
    milestone: 'Milestones',
    category: 'Task Categories',
    impact: 'Impact Goals',
    tokens: 'Token Goals',
    other: 'Special',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 page-transition">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Badges</h1>
        <p className="text-muted-foreground">
          {user 
            ? `You've earned ${earnedCount} of ${totalCount} badges`
            : 'Sign in to track your badges'
          }
        </p>
      </div>

      {/* Progress Overview */}
      {user && (
        <div className="p-4 rounded-xl bg-card border border-border mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Badge Progress</span>
            <span className="text-sm text-muted-foreground">{earnedCount} / {totalCount}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${(earnedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Badge Categories */}
      <div className="space-y-8">
        {Object.entries(groupedBadges).map(([category, categoryBadges]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-4">
              {categoryLabels[category] || category}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {categoryBadges.map((badge) => {
                const isEarned = earnedBadgeIds.includes(badge.id)
                
                return (
                  <div 
                    key={badge.id}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      isEarned 
                        ? 'bg-primary/10 border-primary/50'
                        : 'bg-card border-border opacity-60'
                    }`}
                  >
                    <div className="relative w-16 h-16 mx-auto mb-3">
                      <div className={`w-full h-full rounded-full flex items-center justify-center ${
                        isEarned ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <Award className={`w-8 h-8 ${isEarned ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      {isEarned ? (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <Lock className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{badge.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
