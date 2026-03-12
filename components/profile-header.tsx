import { User } from 'lucide-react'
import type { Profile } from '@/lib/types'

interface ProfileHeaderProps {
  profile: Profile
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {profile.avatar_url ? (
        <img 
          src={profile.avatar_url} 
          alt={profile.username || 'User'} 
          className="w-20 h-20 rounded-full object-cover border-2 border-primary"
        />
      ) : (
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary">
          <User className="w-10 h-10 text-primary" />
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold">{profile.username || 'User'}</h1>
        {profile.full_name && (
          <p className="text-muted-foreground">{profile.full_name}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
            Level {profile.level}
          </span>
          <span className="text-xs text-muted-foreground capitalize">
            {profile.role}
          </span>
        </div>
      </div>
    </div>
  )
}
