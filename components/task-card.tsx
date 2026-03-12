import Link from 'next/link'
import { MapPin, Coins, Clock, ChevronRight, TreePine, Waves, Trees, Heart, Hammer, Bird } from 'lucide-react'
import type { Task, TaskCategory } from '@/lib/types'
import { CATEGORY_LABELS, DIFFICULTY_COLORS } from '@/lib/types'

const CategoryIcon: Record<TaskCategory, React.ElementType> = {
  park_cleanup: Trees,
  forest_cleanup: TreePine,
  river_cleanup: Waves,
  community_help: Heart,
  environmental_building: Hammer,
  wildlife_support: Bird,
}

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const Icon = CategoryIcon[task.category]

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold group-hover:text-primary transition-colors">
              {task.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{CATEGORY_LABELS[task.category]}</span>
              {task.estimated_duration_minutes && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.estimated_duration_minutes} min
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {task.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
            <Coins className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">{task.token_reward} tokens</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[task.difficulty]}`}>
            {task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)}
          </div>
        </div>

        {task.location_name && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate max-w-[120px]">{task.location_name}</span>
          </div>
        )}
      </div>
    </Link>
  )
}
