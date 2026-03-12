import { createClient } from '@/lib/supabase/server'
import { TaskCard } from '@/components/task-card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import type { Task } from '@/lib/types'

async function getTasks() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'available')
    .order('token_reward', { ascending: false })
  
  return (data || []) as Task[]
}

export default async function TasksPage() {
  const tasks = await getTasks()

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 page-transition">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Available Tasks</h1>
        <p className="text-muted-foreground">Find tasks near you and start earning rewards</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search tasks..." 
          className="pl-10"
        />
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tasks available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Check back later or explore the map!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  )
}
