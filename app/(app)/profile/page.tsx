import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Coins, Award, MapPin, Settings, LogOut, 
  ChevronRight, CheckCircle, Clock, XCircle
} from 'lucide-react'
import { ProfileHeader } from '@/components/profile-header'
import { SignOutButton } from '@/components/sign-out-button'
import type { Profile, TaskSubmission, Badge, UserBadge } from '@/lib/types'

async function getProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  return data as Profile | null
}

async function getSubmissions(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('task_submissions')
    .select('*, task:tasks(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)
  
  return (data || []) as TaskSubmission[]
}

async function getUserBadges(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_badges')
    .select('*, badge:badges(*)')
    .eq('user_id', userId)
  
  return (data || []) as UserBadge[]
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const [profile, submissions, badges] = await Promise.all([
    getProfile(user.id),
    getSubmissions(user.id),
    getUserBadges(user.id),
  ])

  if (!profile) {
    redirect('/auth/login')
  }

  // Calculate level progress
  const levelThresholds = [0, 50, 200, 500, 1000]
  const currentLevelMin = levelThresholds[profile.level - 1] || 0
  const nextLevelMin = levelThresholds[profile.level] || 1000
  const progressToNext = ((profile.impact_score - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100

  const levelNames = ['Beginner', 'Volunteer', 'Activist', 'Guardian', 'Champion']

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-24 page-transition">
      {/* Profile Header */}
      <ProfileHeader profile={profile} />

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="flex items-center justify-center gap-1 text-primary mb-1">
            <Coins className="w-4 h-4" />
            <span className="text-xl font-bold">{profile.total_tokens}</span>
          </div>
          <p className="text-xs text-muted-foreground">Tokens</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="flex items-center justify-center gap-1 text-accent mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xl font-bold">{profile.impact_score}</span>
          </div>
          <p className="text-xs text-muted-foreground">Impact</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xl font-bold">{profile.tasks_completed}</span>
          </div>
          <p className="text-xs text-muted-foreground">Tasks</p>
        </div>
      </div>

      {/* Level Progress */}
      <div className="p-4 rounded-xl bg-card border border-border mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">Level {profile.level}: {levelNames[profile.level - 1]}</span>
          <span className="text-sm text-muted-foreground">
            {profile.impact_score} / {nextLevelMin} points
          </span>
        </div>
        <Progress value={Math.min(progressToNext, 100)} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {nextLevelMin - profile.impact_score} more points to Level {profile.level + 1}
        </p>
      </div>

      {/* Badges */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Badges</h2>
          <Link href="/badges" className="text-sm text-primary">View All</Link>
        </div>
        {badges.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {badges.map((ub) => (
              <div 
                key={ub.id}
                className="flex-shrink-0 w-20 text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <p className="text-xs font-medium truncate">{ub.badge?.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-muted/50 text-center">
            <Award className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Complete tasks to earn badges</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div 
                key={sub.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  sub.status === 'approved' 
                    ? 'bg-green-500/20 text-green-400'
                    : sub.status === 'rejected'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {sub.status === 'approved' && <CheckCircle className="w-5 h-5" />}
                  {sub.status === 'rejected' && <XCircle className="w-5 h-5" />}
                  {(sub.status === 'pending' || sub.status === 'manual_review') && <Clock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{sub.task?.title || 'Task'}</p>
                  <p className="text-xs text-muted-foreground">
                    {sub.status === 'approved' && `+${sub.tokens_awarded} tokens`}
                    {sub.status === 'rejected' && 'Verification failed'}
                    {sub.status === 'pending' && 'Awaiting verification'}
                    {sub.status === 'manual_review' && 'Under review'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-muted/50 text-center">
            <MapPin className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No activity yet. Start a task!</p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/tasks">Browse Tasks</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Account Actions */}
      <div className="space-y-3">
        <Button variant="outline" className="w-full justify-start gap-3" asChild>
          <Link href="/settings">
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </Button>
        <SignOutButton />
      </div>
    </div>
  )
}
