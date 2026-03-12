'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { X, MapPin, Coins, Clock, ChevronRight, TreePine, Waves, Trees, Heart, Hammer, Bird } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { Task, TaskCategory } from '@/lib/types'
import { CATEGORY_LABELS, DIFFICULTY_COLORS } from '@/lib/types'

// Dynamic import for leaflet (SSR issues)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
)

const CategoryIcon: Record<TaskCategory, React.ElementType> = {
  park_cleanup: Trees,
  forest_cleanup: TreePine,
  river_cleanup: Waves,
  community_help: Heart,
  environmental_building: Hammer,
  wildlife_support: Bird,
}

interface ImpactMapProps {
  tasks: Task[]
}

export function ImpactMap({ tasks }: ImpactMapProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const router = useRouter()

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task)
  }, [])

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'available': return '#6b7280' // Gray
      case 'active': return '#3b82f6' // Blue
      case 'completed': return '#22c55e' // Green
      default: return '#6b7280'
    }
  }

  return (
    <>
      <div className="w-full h-full relative">
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        
        <MapContainer
          center={[20, 0]}
          zoom={2}
          className="w-full h-full z-0"
          style={{ background: '#1a1a2e' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {tasks.map((task) => (
            <TaskMarker
              key={task.id}
              task={task}
              color={getMarkerColor(task.status)}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 z-[1000]">
          <div className="text-xs font-medium mb-2">Task Status</div>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-500" />
              <span className="text-xs text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Detail Sheet */}
      <Sheet open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
          {selectedTask && (
            <>
              <SheetHeader className="text-left pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  {(() => {
                    const Icon = CategoryIcon[selectedTask.category]
                    return <Icon className="w-4 h-4" />
                  })()}
                  {CATEGORY_LABELS[selectedTask.category]}
                </div>
                <SheetTitle className="text-xl">{selectedTask.title}</SheetTitle>
              </SheetHeader>

              <div className="space-y-6">
                <p className="text-muted-foreground">{selectedTask.description}</p>

                <div className="flex flex-wrap gap-2">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${DIFFICULTY_COLORS[selectedTask.difficulty]}`}>
                    {selectedTask.difficulty.charAt(0).toUpperCase() + selectedTask.difficulty.slice(1)}
                  </div>
                  {selectedTask.estimated_duration_minutes && (
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedTask.estimated_duration_minutes} min
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-2 text-primary mb-1">
                      <Coins className="w-4 h-4" />
                      <span className="text-lg font-bold">{selectedTask.token_reward}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Token Reward</div>
                  </div>
                  <div className="p-4 rounded-lg bg-card border border-border">
                    <div className="flex items-center gap-2 text-accent mb-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-lg font-bold">{selectedTask.impact_points}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Impact Points</div>
                  </div>
                </div>

                {selectedTask.location_name && (
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <div className="font-medium">{selectedTask.location_name}</div>
                      {selectedTask.location_address && (
                        <div className="text-sm text-muted-foreground">{selectedTask.location_address}</div>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full gap-2" 
                  size="lg"
                  onClick={() => router.push(`/tasks/${selectedTask.id}`)}
                >
                  View Task Details
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

// Custom marker component
function TaskMarker({ 
  task, 
  color, 
  onClick 
}: { 
  task: Task
  color: string
  onClick: () => void 
}) {
  const [L, setL] = useState<typeof import('leaflet') | null>(null)

  // Load leaflet on client
  if (typeof window !== 'undefined' && !L) {
    import('leaflet').then((leaflet) => {
      setL(leaflet.default)
    })
  }

  if (!L) return null

  const icon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 24px;
        height: 24px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          opacity: 0.8;
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

  return (
    <Marker
      position={[task.latitude, task.longitude]}
      icon={icon}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="p-2">
          <div className="font-medium">{task.title}</div>
          <div className="text-sm text-muted-foreground">{task.token_reward} tokens</div>
        </div>
      </Popup>
    </Marker>
  )
}
