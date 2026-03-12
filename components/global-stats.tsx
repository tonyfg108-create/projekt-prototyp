import { Leaf, Trash2, Users, Coins } from 'lucide-react'
import type { GlobalStats as GlobalStatsType } from '@/lib/types'

interface GlobalStatsProps {
  stats: GlobalStatsType | null
}

export function GlobalStats({ stats }: GlobalStatsProps) {
  const items = [
    {
      icon: Leaf,
      value: stats?.total_tasks_completed ?? 0,
      label: 'Tasks',
      color: 'text-green-400',
    },
    {
      icon: Trash2,
      value: stats?.total_trash_kg ?? 0,
      label: 'kg removed',
      color: 'text-blue-400',
    },
    {
      icon: Users,
      value: stats?.total_volunteers ?? 0,
      label: 'Volunteers',
      color: 'text-purple-400',
    },
    {
      icon: Coins,
      value: stats?.total_tokens_distributed ?? 0,
      label: 'Tokens',
      color: 'text-primary',
    },
  ]

  return (
    <div className="flex items-center justify-around p-3 bg-card/50 border-b border-border">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <item.icon className={`w-4 h-4 ${item.color}`} />
          <div>
            <div className="text-sm font-bold">{item.value.toLocaleString()}</div>
            <div className="text-[10px] text-muted-foreground">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
