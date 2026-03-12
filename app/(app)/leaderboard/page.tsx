import { createClient } from '@/lib/supabase/server'
import { Trophy, Medal, Award, User, Coins } from 'lucide-react'
import type { Profile } from '@/lib/types'

async function getTopVolunteers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, impact_score, total_tokens, tasks_completed, level')
    .eq('role', 'volunteer')
    .order('impact_score', { ascending: false })
    .limit(50)
  
  return (data || []) as Profile[]
}

export default async function LeaderboardPage() {
  const volunteers = await getTopVolunteers()

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-400" />
      case 1: return <Medal className="w-6 h-6 text-gray-400" />
      case 2: return <Medal className="w-6 h-6 text-amber-600" />
      default: return <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
    }
  }

  const getRankBg = (index: number) => {
    switch (index) {
      case 0: return 'bg-yellow-500/10 border-yellow-500/30'
      case 1: return 'bg-gray-500/10 border-gray-500/30'
      case 2: return 'bg-amber-500/10 border-amber-500/30'
      default: return 'bg-card border-border'
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 page-transition">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Top contributors making real-world impact</p>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {volunteers.slice(0, 3).map((user, index) => (
          <div 
            key={user.id}
            className={`p-4 rounded-xl border text-center ${
              index === 0 
                ? 'bg-yellow-500/10 border-yellow-500/30 order-2' 
                : index === 1 
                ? 'bg-gray-500/10 border-gray-500/30 order-1'
                : 'bg-amber-500/10 border-amber-500/30 order-3'
            }`}
          >
            <div className="flex justify-center mb-2">
              {getRankIcon(index)}
            </div>
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.username || 'User'} 
                className={`w-12 h-12 mx-auto rounded-full object-cover mb-2 ${
                  index === 0 ? 'ring-2 ring-yellow-400' : ''
                }`}
              />
            ) : (
              <div className={`w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-2 ${
                index === 0 ? 'ring-2 ring-yellow-400' : ''
              }`}>
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <p className="font-semibold text-sm truncate">{user.username || 'Anonymous'}</p>
            <p className="text-lg font-bold text-primary">{user.impact_score}</p>
            <p className="text-xs text-muted-foreground">impact points</p>
          </div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="space-y-2">
        {volunteers.slice(3).map((user, index) => (
          <div 
            key={user.id}
            className={`flex items-center gap-4 p-4 rounded-xl border ${getRankBg(index + 3)}`}
          >
            <div className="w-8 flex justify-center">
              {getRankIcon(index + 3)}
            </div>
            
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.username || 'User'} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.username || 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">Level {user.level}</p>
            </div>
            
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-primary">
                <Award className="w-4 h-4" />
                <span className="font-bold">{user.impact_score}</span>
              </div>
              <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                <Coins className="w-3 h-3" />
                <span>{user.total_tokens}</span>
              </div>
            </div>
          </div>
        ))}

        {volunteers.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No volunteers yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  )
}
