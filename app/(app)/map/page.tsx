import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ImpactMap } from '@/components/impact-map'
import { MapFilters } from '@/components/map-filters'
import { GlobalStats } from '@/components/global-stats'
import { Skeleton } from '@/components/ui/skeleton'
import type { Task } from '@/lib/types'

async function getTasks() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tasks')
    .select('*')
    .in('status', ['available', 'active', 'completed'])
    .order('created_at', { ascending: false })
  
  return (data || []) as Task[]
}

async function getGlobalStats() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('global_stats')
    .select('*')
    .single()
  
  return data
}

export default async function MapPage() {
  const [tasks, stats] = await Promise.all([getTasks(), getGlobalStats()])

  return (
    <div className="h-[calc(100vh-3.5rem-4rem)] flex flex-col">
      {/* Stats Bar */}
      <Suspense fallback={<Skeleton className="h-16" />}>
        <GlobalStats stats={stats} />
      </Suspense>

      {/* Filters */}
      <MapFilters />

      {/* Map */}
      <div className="flex-1 relative">
        <Suspense fallback={<MapSkeleton />}>
          <ImpactMap tasks={tasks} />
        </Suspense>
      </div>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="w-full h-full bg-card animate-pulse flex items-center justify-center">
      <p className="text-muted-foreground">Loading map...</p>
    </div>
  )
}
