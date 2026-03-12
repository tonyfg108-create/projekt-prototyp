import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { 
  Plus, BarChart3, Users, CheckCircle, 
  Clock, Building2, ExternalLink
} from 'lucide-react'
import type { Organization, Task, TaskSubmission } from '@/lib/types'

async function getOrganization(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('organizations')
    .select('*')
    .eq('owner_id', userId)
    .single()
  
  return data as Organization | null
}

async function getOrgTasks(orgId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
  
  return (data || []) as Task[]
}

async function getPendingSubmissions(orgId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('task_submissions')
    .select('*, task:tasks!inner(*), user:profiles(*)')
    .eq('task.organization_id', orgId)
    .eq('status', 'manual_review')
    .order('created_at', { ascending: false })
    .limit(10)
  
  return (data || []) as TaskSubmission[]
}

export default async function OrganizationDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const organization = await getOrganization(user.id)

  if (!organization) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center page-transition">
        <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Create Your Organization</h1>
        <p className="text-muted-foreground mb-6">
          Set up your organization to create tasks and track community impact
        </p>
        <Button asChild>
          <Link href="/organization/create">Create Organization</Link>
        </Button>
      </div>
    )
  }

  const [tasks, pendingSubmissions] = await Promise.all([
    getOrgTasks(organization.id),
    getPendingSubmissions(organization.id),
  ])

  const activeTasks = tasks.filter(t => t.status === 'available')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 page-transition">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{organization.name}</h1>
          <p className="text-muted-foreground">{organization.org_type || 'Organization'}</p>
        </div>
        <Button asChild>
          <Link href="/organization/tasks/new">
            <Plus className="w-4 h-4 mr-2" />
            Create Task
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Total Tasks</span>
          </div>
          <p className="text-2xl font-bold">{tasks.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Active</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{activeTasks.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{completedTasks.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Impact</span>
          </div>
          <p className="text-2xl font-bold text-primary">{organization.total_impact_generated}</p>
        </div>
      </div>

      {/* Pending Reviews */}
      {pendingSubmissions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Pending Reviews</h2>
          <div className="space-y-3">
            {pendingSubmissions.map((sub) => (
              <div 
                key={sub.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-yellow-500/30"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                  {sub.before_photo_url && (
                    <img 
                      src={sub.before_photo_url} 
                      alt="Before" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{sub.task?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    by {sub.user?.username || 'User'} • Needs manual review
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/organization/review/${sub.id}`}>
                    Review
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Tasks</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/organization/tasks">View All</Link>
          </Button>
        </div>
        
        {tasks.length > 0 ? (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <Link
                key={task.id}
                href={`/organization/tasks/${task.id}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
              >
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'available' ? 'bg-green-400' :
                  task.status === 'active' ? 'bg-blue-400' :
                  'bg-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {task.times_completed} completions • {task.token_reward} tokens
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground mb-4">No tasks created yet</p>
            <Button asChild>
              <Link href="/organization/tasks/new">Create Your First Task</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
