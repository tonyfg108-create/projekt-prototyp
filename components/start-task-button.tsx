'use client'

import { useRouter } from 'next/navigation'
import { Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from './auth-provider'
import { toast } from 'sonner'

interface StartTaskButtonProps {
  taskId: string
}

export function StartTaskButton({ taskId }: StartTaskButtonProps) {
  const router = useRouter()
  const { user } = useAuth()

  const handleStart = () => {
    if (!user) {
      toast.error('Please sign in to start a task')
      router.push('/auth/login')
      return
    }
    
    router.push(`/submit?task=${taskId}`)
  }

  return (
    <Button className="w-full gap-2" size="lg" onClick={handleStart}>
      <Camera className="w-5 h-5" />
      Start Task
    </Button>
  )
}
