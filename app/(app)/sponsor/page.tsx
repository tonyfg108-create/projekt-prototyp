import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { 
  Plus, Coins, TrendingUp, Users, 
  Target, Building, Award
} from 'lucide-react'
import type { Sponsor, Challenge } from '@/lib/types'

async function getSponsor(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('sponsors')
    .select('*')
    .eq('owner_id', userId)
    .single()
  
  return data as Sponsor | null
}

async function getSponsoredChallenges(sponsorId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('challenges')
    .select('*')
    .eq('sponsor_id', sponsorId)
    .order('created_at', { ascending: false })
  
  return (data || []) as Challenge[]
}

export default async function SponsorDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const sponsor = await getSponsor(user.id)

  if (!sponsor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center page-transition">
        <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Become a Sponsor</h1>
        <p className="text-muted-foreground mb-6">
          Fund rewards and sponsor environmental campaigns
        </p>
        <Button asChild>
          <Link href="/sponsor/create">Create Sponsor Profile</Link>
        </Button>
      </div>
    )
  }

  const challenges = await getSponsoredChallenges(sponsor.id)
  const activeChallenges = challenges.filter(c => c.is_active)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{sponsor.name}</h1>
          <p className="text-muted-foreground">{sponsor.sponsor_type || 'Sponsor'}</p>
        </div>
        <Button asChild>
          <Link href="/sponsor/challenges/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Challenge
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Coins className="w-4 h-4" />
            <span className="text-sm">Tokens Funded</span>
          </div>
          <p className="text-2xl font-bold text-primary">{sponsor.total_tokens_funded}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-sm">Campaigns</span>
          </div>
          <p className="text-2xl font-bold">{sponsor.total_campaigns}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{activeChallenges.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Participants</span>
          </div>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Your Challenges</h2>
        {challenges.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {challenges.map((challenge) => (
              <div 
                key={challenge.id}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {challenge.description}
                    </p>
                  </div>
                  {challenge.is_active ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
                      Ended
                    </span>
                  )}
                </div>
                
                {challenge.target_kg && (
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{challenge.current_kg} / {challenge.target_kg} kg</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((challenge.current_kg / challenge.target_kg) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Ends {new Date(challenge.ends_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1 text-primary">
                    <Award className="w-4 h-4" />
                    <span>{challenge.bonus_tokens} bonus tokens</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No challenges yet</p>
            <Button asChild>
              <Link href="/sponsor/challenges/new">Create Your First Challenge</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
