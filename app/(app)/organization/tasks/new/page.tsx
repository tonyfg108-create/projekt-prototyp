'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import { CATEGORY_LABELS, type TaskCategory, type TaskDifficulty } from '@/lib/types'

const categories: TaskCategory[] = [
  'park_cleanup',
  'forest_cleanup',
  'river_cleanup',
  'community_help',
  'environmental_building',
  'wildlife_support',
]

const difficulties: TaskDifficulty[] = ['easy', 'medium', 'hard', 'expert']

export default function CreateTaskPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [organization, setOrganization] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [instructions, setInstructions] = useState('')
  const [category, setCategory] = useState<TaskCategory>('park_cleanup')
  const [difficulty, setDifficulty] = useState<TaskDifficulty>('medium')
  const [tokenReward, setTokenReward] = useState(15)
  const [impactPoints, setImpactPoints] = useState(10)
  const [estimatedDuration, setEstimatedDuration] = useState(60)
  const [estimatedTrash, setEstimatedTrash] = useState(5)
  const [locationName, setLocationName] = useState('')
  const [locationAddress, setLocationAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  useEffect(() => {
    if (!user) return

    const fetchOrg = async () => {
      const { data } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .single()
      
      if (data) setOrganization(data)
    }

    fetchOrg()
  }, [user, supabase])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString())
          setLongitude(position.coords.longitude.toString())
          toast.success('Location captured')
        },
        (error) => {
          toast.error('Could not get location')
        }
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !organization) return

    setLoading(true)
    try {
      const { error } = await supabase.from('tasks').insert({
        created_by: user.id,
        organization_id: organization.id,
        title,
        description,
        instructions: instructions || null,
        category,
        difficulty,
        status: 'available',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        location_name: locationName,
        location_address: locationAddress || null,
        token_reward: tokenReward,
        impact_points: impactPoints,
        estimated_duration_minutes: estimatedDuration,
        estimated_trash_kg: estimatedTrash,
      })

      if (error) throw error

      // Update org stats
      await supabase
        .from('organizations')
        .update({ total_tasks_created: organization.id })
        .eq('id', organization.id)

      toast.success('Task created successfully!')
      router.push('/organization')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  if (!organization) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Loading organization...</p>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 page-transition">
      <Link 
        href="/organization" 
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <h1 className="text-2xl font-bold mb-6">Create New Task</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Central Park Cleanup"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Help clean up litter in the park area..."
            rows={3}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Step-by-step instructions for completing the task..."
            rows={3}
          />
        </div>

        <div className="space-y-3">
          <Label>Category *</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                  category === cat
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Difficulty *</Label>
          <div className="grid grid-cols-4 gap-2">
            {difficulties.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`p-2 rounded-lg border text-center text-sm capitalize transition-colors ${
                  difficulty === d
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tokenReward">Token Reward</Label>
            <Input
              id="tokenReward"
              type="number"
              value={tokenReward}
              onChange={(e) => setTokenReward(parseInt(e.target.value) || 0)}
              min={1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="impactPoints">Impact Points</Label>
            <Input
              id="impactPoints"
              type="number"
              value={impactPoints}
              onChange={(e) => setImpactPoints(parseInt(e.target.value) || 0)}
              min={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trash">Est. Trash (kg)</Label>
            <Input
              id="trash"
              type="number"
              value={estimatedTrash}
              onChange={(e) => setEstimatedTrash(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Location *</Label>
            <Button type="button" variant="outline" size="sm" onClick={getCurrentLocation}>
              <MapPin className="w-4 h-4 mr-1" />
              Use Current
            </Button>
          </div>
          
          <div className="space-y-2">
            <Input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Location name (e.g., Central Park)"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Input
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="Address (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude"
              required
            />
            <Input
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
              required
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg" 
          disabled={loading || !title || !description || !latitude || !longitude}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create Task
        </Button>
      </form>
    </div>
  )
}
