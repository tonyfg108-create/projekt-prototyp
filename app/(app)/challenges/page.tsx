import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Target, Clock, Users, Award, ChevronRight } from 'lucide-react'
import type { Challenge } from '@/lib/types'

async function getActiveChallenges() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('challenges')
    .select('*, organization:organizations(name), sponsor:sponsors(name)')
    .eq('is_active', true)
    .order('ends_at', { ascending: true })
  
  return (data || []) as Challenge[]
}

export default async function ChallengesPage() {
  const challenges = await getActiveChallenges()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 page-transition">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Active Challenges</h1>
        <p className="text-muted-foreground">Join community challenges for bonus rewards</p>
      </div>

      {challenges.length > 0 ? (
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const progress = challenge.target_kg 
              ? (challenge.current_kg / challenge.target_kg) * 100
              : challenge.target_tasks
              ? (challenge.current_tasks / challenge.target_tasks) * 100
              : 0

            const daysLeft = Math.ceil(
              (new Date(challenge.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )

            return (
              <Link
                key={challenge.id}
                href={`/challenges/${challenge.id}`}
                className="block p-5 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{challenge.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {challenge.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {challenge.target_kg 
                        ? `${challenge.current_kg} / ${challenge.target_kg} kg`
                        : `${challenge.current_tasks} / ${challenge.target_tasks} tasks`
                      }
                    </span>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" />
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ending soon'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Award className="w-4 h-4" />
                    <span>+{challenge.bonus_tokens} bonus</span>
                  </div>
                  {(challenge.organization?.name || challenge.sponsor?.name) && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{challenge.organization?.name || challenge.sponsor?.name}</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Active Challenges</h2>
          <p className="text-muted-foreground mb-6">
            Check back soon for new community challenges
          </p>
          <Button asChild variant="outline">
            <Link href="/tasks">Browse Tasks Instead</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
