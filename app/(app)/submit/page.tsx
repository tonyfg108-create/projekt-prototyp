'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Camera, Upload, ChevronLeft, ChevronRight, 
  MapPin, Check, Loader2, AlertCircle, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'
import type { Task, TaskSubmission } from '@/lib/types'

const STEPS = [
  { id: 1, title: 'Before Photo', description: 'Take a photo of the area before cleaning' },
  { id: 2, title: 'Do the Task', description: 'Complete the cleanup or task' },
  { id: 3, title: 'After Photo', description: 'Take a photo showing your impact' },
  { id: 4, title: 'Submit', description: 'Review and submit for verification' },
]

export default function SubmitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = searchParams.get('task')
  const { user, profile } = useAuth()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [task, setTask] = useState<Task | null>(null)
  const [submission, setSubmission] = useState<Partial<TaskSubmission> | null>(null)
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null)
  const [beforePreview, setBeforePreview] = useState<string | null>(null)
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null)
  const [afterPreview, setAfterPreview] = useState<string | null>(null)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch task details
  useEffect(() => {
    if (!taskId) return

    const fetchTask = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single()
      
      if (data) setTask(data as Task)
    }

    const fetchExistingSubmission = async () => {
      if (!user) return
      
      const { data } = await supabase
        .from('task_submissions')
        .select('*')
        .eq('task_id', taskId)
        .eq('user_id', user.id)
        .in('status', ['pending'])
        .single()
      
      if (data) {
        setSubmission(data)
        if (data.before_photo_url) {
          setBeforePreview(data.before_photo_url)
          setStep(2) // Skip to step 2 if before photo exists
        }
      }
    }

    fetchTask()
    fetchExistingSubmission()
  }, [taskId, user, supabase])

  // Get user location
  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
          toast.error('Could not get your location. Please enable location services.')
        }
      )
    }
  }, [])

  useEffect(() => {
    getLocation()
  }, [getLocation])

  // Handle photo capture/upload
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0]
    if (!file) return

    const preview = URL.createObjectURL(file)
    
    if (type === 'before') {
      setBeforePhoto(file)
      setBeforePreview(preview)
    } else {
      setAfterPhoto(file)
      setAfterPreview(preview)
    }
  }

  // Upload photo to Vercel Blob
  const uploadPhoto = async (file: File, type: 'before' | 'after'): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('taskId', taskId || '')

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      return data.url
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload photo')
      return null
    }
  }

  // Submit before photo and create submission
  const handleBeforePhotoSubmit = async () => {
    if (!beforePhoto || !user || !taskId) return

    setLoading(true)
    try {
      const photoUrl = await uploadPhoto(beforePhoto, 'before')
      if (!photoUrl) return

      const { data, error } = await supabase
        .from('task_submissions')
        .insert({
          task_id: taskId,
          user_id: user.id,
          status: 'pending',
          before_photo_url: photoUrl,
          before_latitude: location?.lat,
          before_longitude: location?.lng,
          before_timestamp: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      setSubmission(data)
      setStep(2)
      toast.success('Before photo saved! Now complete the task.')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save photo')
    } finally {
      setLoading(false)
    }
  }

  // Submit after photo
  const handleAfterPhotoSubmit = async () => {
    if (!afterPhoto || !submission?.id) return

    setLoading(true)
    try {
      const photoUrl = await uploadPhoto(afterPhoto, 'after')
      if (!photoUrl) return

      const { error } = await supabase
        .from('task_submissions')
        .update({
          after_photo_url: photoUrl,
          after_latitude: location?.lat,
          after_longitude: location?.lng,
          after_timestamp: new Date().toISOString(),
        })
        .eq('id', submission.id)

      if (error) throw error

      setSubmission(prev => prev ? { ...prev, after_photo_url: photoUrl } : null)
      setStep(4)
      toast.success('After photo saved! Review your submission.')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to save photo')
    } finally {
      setLoading(false)
    }
  }

  // Final submission for AI verification
  const handleFinalSubmit = async () => {
    if (!submission?.id) return

    setSubmitting(true)
    try {
      // Trigger AI verification
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: submission.id }),
      })

      if (!response.ok) throw new Error('Verification failed')

      toast.success('Submitted for verification!')
      router.push('/profile')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold mb-2">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">Please sign in to submit tasks</p>
        <Button asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  if (!taskId || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold mb-2">No Task Selected</h1>
        <p className="text-muted-foreground mb-6">Please select a task to start</p>
        <Button asChild>
          <Link href="/tasks">Browse Tasks</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 page-transition">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">{task.title}</h1>
          <p className="text-sm text-muted-foreground">Step {step} of 4</p>
        </div>
      </div>

      {/* Progress */}
      <Progress value={(step / 4) * 100} className="mb-8" />

      {/* Step Content */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">{STEPS[step - 1].title}</h2>
        <p className="text-muted-foreground">{STEPS[step - 1].description}</p>
      </div>

      {/* Step 1: Before Photo */}
      {step === 1 && (
        <div className="space-y-6">
          {beforePreview ? (
            <div className="relative">
              <img 
                src={beforePreview} 
                alt="Before" 
                className="w-full aspect-[4/3] object-cover rounded-xl"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setBeforePhoto(null)
                  setBeforePreview(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
              <Camera className="w-12 h-12 text-muted-foreground mb-3" />
              <span className="text-muted-foreground">Tap to take or upload photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handlePhotoChange(e, 'before')}
              />
            </label>
          )}

          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Location captured: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
            </div>
          )}

          <Button 
            className="w-full" 
            size="lg"
            disabled={!beforePhoto || loading}
            onClick={handleBeforePhotoSubmit}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            Continue
          </Button>
        </div>
      )}

      {/* Step 2: Do the Task */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-card border border-border text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Now complete the task!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {task.instructions || task.description}
            </p>
            {task.estimated_duration_minutes && (
              <p className="text-xs text-muted-foreground">
                Estimated time: {task.estimated_duration_minutes} minutes
              </p>
            )}
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => setStep(3)}
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            {"I've completed the task"}
          </Button>
        </div>
      )}

      {/* Step 3: After Photo */}
      {step === 3 && (
        <div className="space-y-6">
          {afterPreview ? (
            <div className="relative">
              <img 
                src={afterPreview} 
                alt="After" 
                className="w-full aspect-[4/3] object-cover rounded-xl"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => {
                  setAfterPhoto(null)
                  setAfterPreview(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full aspect-[4/3] rounded-xl border-2 border-dashed border-border hover:border-primary/50 cursor-pointer transition-colors">
              <Camera className="w-12 h-12 text-muted-foreground mb-3" />
              <span className="text-muted-foreground">Tap to take or upload photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handlePhotoChange(e, 'after')}
              />
            </label>
          )}

          <Button 
            className="w-full" 
            size="lg"
            disabled={!afterPhoto || loading}
            onClick={handleAfterPhotoSubmit}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            Continue
          </Button>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Before</p>
              {beforePreview && (
                <img 
                  src={beforePreview} 
                  alt="Before" 
                  className="w-full aspect-square object-cover rounded-xl"
                />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">After</p>
              {afterPreview && (
                <img 
                  src={afterPreview} 
                  alt="After" 
                  className="w-full aspect-square object-cover rounded-xl"
                />
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-card border border-border">
            <h3 className="font-semibold mb-2">Reward Summary</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tokens</span>
              <span className="font-medium text-primary">{task.token_reward}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Impact Points</span>
              <span className="font-medium text-accent">{task.impact_points}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-sm text-muted-foreground">
              Your submission will be verified by AI. If approved, rewards will be added to your account automatically.
            </p>
          </div>

          <Button 
            className="w-full" 
            size="lg"
            disabled={submitting}
            onClick={handleFinalSubmit}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Submit for Verification
          </Button>
        </div>
      )}
    </div>
  )
}
