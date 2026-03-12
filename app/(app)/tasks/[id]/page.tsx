import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { 
  MapPin, Coins, Clock, ChevronLeft, 
  TreePine, Waves, Trees, Heart, Hammer, Bird,
  AlertCircle, CheckCircle, Users
} from 'lucide-react'
import type { Task, TaskCategory } from '@/lib/types'
import { CATEGORY_LABELS, DIFFICULTY_COLORS, STATUS_COLORS } from '@/lib/types'
import { StartTaskButton } from '@/components/start-task-button'

const CategoryIcon: Record<TaskCategory, React.ElementType> = {
  park_cleanup: Trees,
  forest_cleanup: TreePine,
  river_cleanup: Waves,
  community_help: Heart,
  environmental_building: Hammer,
  wildlife_support: Bird,
}

async function getTask(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select('*, organization:organizations(*), sponsor:sponsors(*)')
    .eq('id', id)
    .single()
  
  return data as Task | null
}

async function getActiveSubmission(taskId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data } = await supabase
    .from('task_submissions')
    .select('*')
    .eq('task_id', taskId)
    .eq('user_id', user.id)
    .in('status', ['pending', 'manual_review'])
    .single()
  
  return data
}

export default async function TaskDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  const [task, activeSubmission] = await Promise.all([
    getTask(id),
    getActiveSubmission(id),
  ])

  if (!task) {
    notFound()
  }

  const Icon = CategoryIcon[task.category]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-32 page-transition">
      {/* Back Button */}
      <Link 
        href="/tasks" 
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Tasks
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <Icon className="w-4 h-4" />
          {CATEGORY_LABELS[task.category]}
        </div>
        <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[task.difficulty]}`}>
            {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[task.status]}`}>
            {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
          </div>
        </div>
      </div>

      {/* Rewards Card */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Coins className="w-5 h-5" />
            <span className="text-2xl font-bold">{task.token_reward}</span>
          </div>
          <div className="text-sm text-muted-foreground">Token Reward</div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-accent mb-1">
            <CheckCircle className="w-5 h-5" />
            <span className="text-2xl font-bold">{task.impact_points}</span>
          </div>
          <div className="text-sm text-muted-foreground">Impact Points</div>
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p className="text-muted-foreground">{task.description}</p>
      </div>

      {/* Instructions */}
      {task.instructions && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-muted-foreground whitespace-pre-wrap">{task.instructions}</p>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Details</h2>
        <div className="space-y-3">
          {task.location_name && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
              <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <div className="font-medium">{task.location_name}</div>
                {task.location_address && (
                  <div className="text-sm text-muted-foreground">{task.location_address}</div>
                )}
              </div>
            </div>
          )}

          {task.estimated_duration_minutes && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Estimated Duration</div>
                <div className="text-sm text-muted-foreground">{task.estimated_duration_minutes} minutes</div>
              </div>
            </div>
          )}

          {task.estimated_trash_kg && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              <AlertCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium">Estimated Trash</div>
                <div className="text-sm text-muted-foreground">{task.estimated_trash_kg} kg</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
            <Users className="w-5 h-5 text-muted-foreground" />
            <div>
              <div className="font-medium">Completions</div>
              <div className="text-sm text-muted-foreground">{task.times_completed} times completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Organization/Sponsor Info */}
      {(task.organization || task.sponsor) && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">
            {task.organization ? 'Organized by' : 'Sponsored by'}
          </h2>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {(task.organization?.name || task.sponsor?.name || 'A').charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-medium">{task.organization?.name || task.sponsor?.name}</div>
              <div className="text-sm text-muted-foreground">
                {task.organization?.org_type || task.sponsor?.sponsor_type || 'Organization'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border">
        <div className="max-w-3xl mx-auto">
          {activeSubmission ? (
            <Button asChild className="w-full" size="lg">
              <Link href={`/submit?task=${task.id}`}>
                Continue Submission
              </Link>
            </Button>
          ) : task.status === 'available' ? (
            <StartTaskButton taskId={task.id} />
          ) : (
            <Button className="w-full" size="lg" disabled>
              {task.status === 'completed' ? 'Task Completed' : 'Task Unavailable'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
