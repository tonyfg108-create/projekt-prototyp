export type UserRole = 'volunteer' | 'organization' | 'sponsor' | 'admin'

export type TaskCategory = 
  | 'park_cleanup' 
  | 'forest_cleanup' 
  | 'river_cleanup' 
  | 'community_help' 
  | 'environmental_building' 
  | 'wildlife_support'

export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'expert'

export type TaskStatus = 'available' | 'active' | 'pending_verification' | 'completed' | 'rejected'

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'manual_review'

export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  bio: string | null
  impact_score: number
  total_tokens: number
  tasks_completed: number
  level: number
  location_city: string | null
  location_country: string | null
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  owner_id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  org_type: string | null
  verified: boolean
  location_city: string | null
  location_country: string | null
  total_tasks_created: number
  total_impact_generated: number
  created_at: string
  updated_at: string
}

export interface Sponsor {
  id: string
  owner_id: string
  name: string
  description: string | null
  logo_url: string | null
  website: string | null
  sponsor_type: string | null
  total_tokens_funded: number
  total_campaigns: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  created_by: string | null
  organization_id: string | null
  sponsor_id: string | null
  title: string
  description: string
  instructions: string | null
  category: TaskCategory
  difficulty: TaskDifficulty
  status: TaskStatus
  latitude: number
  longitude: number
  location_name: string | null
  location_address: string | null
  token_reward: number
  impact_points: number
  estimated_trash_kg: number | null
  estimated_duration_minutes: number | null
  max_participants: number
  current_participants: number
  times_completed: number
  expires_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  organization?: Organization
  sponsor?: Sponsor
}

export interface TaskSubmission {
  id: string
  task_id: string
  user_id: string
  status: SubmissionStatus
  before_photo_url: string
  before_latitude: number | null
  before_longitude: number | null
  before_timestamp: string
  after_photo_url: string | null
  after_latitude: number | null
  after_longitude: number | null
  after_timestamp: string | null
  video_url: string | null
  ai_confidence_score: number | null
  ai_analysis: Record<string, unknown> | null
  ai_trash_detected_before: number | null
  ai_trash_detected_after: number | null
  ai_estimated_kg_removed: number | null
  tokens_awarded: number
  impact_awarded: number
  reviewed_by: string | null
  review_notes: string | null
  reviewed_at: string | null
  started_at: string
  completed_at: string | null
  created_at: string
  // Joined fields
  task?: Task
  user?: Profile
}

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string | null
  category: string | null
  requirement_type: string | null
  requirement_value: number
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  awarded_at: string
  badge?: Badge
}

export interface Challenge {
  id: string
  created_by: string | null
  organization_id: string | null
  sponsor_id: string | null
  title: string
  description: string
  image_url: string | null
  target_kg: number | null
  current_kg: number
  target_tasks: number | null
  current_tasks: number
  bonus_tokens: number
  starts_at: string
  ends_at: string
  is_active: boolean
  created_at: string
  // Joined fields
  organization?: Organization
  sponsor?: Sponsor
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  user_id: string
  contribution_kg: number
  tasks_completed: number
  joined_at: string
}

export interface TokenTransaction {
  id: string
  user_id: string
  amount: number
  transaction_type: string
  description: string | null
  related_task_id: string | null
  related_challenge_id: string | null
  created_at: string
}

export interface GlobalStats {
  id: string
  total_tasks_completed: number
  total_trash_kg: number
  total_volunteers: number
  total_tokens_distributed: number
  updated_at: string
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  park_cleanup: 'Park Cleanup',
  forest_cleanup: 'Forest Cleanup',
  river_cleanup: 'River Cleanup',
  community_help: 'Community Help',
  environmental_building: 'Environmental Building',
  wildlife_support: 'Wildlife Support',
}

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  park_cleanup: 'Trees',
  forest_cleanup: 'TreePine',
  river_cleanup: 'Waves',
  community_help: 'Heart',
  environmental_building: 'Hammer',
  wildlife_support: 'Bird',
}

export const DIFFICULTY_COLORS: Record<TaskDifficulty, string> = {
  easy: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  hard: 'bg-orange-500/20 text-orange-400',
  expert: 'bg-red-500/20 text-red-400',
}

export const STATUS_COLORS: Record<TaskStatus, string> = {
  available: 'bg-muted text-muted-foreground',
  active: 'bg-blue-500/20 text-blue-400',
  pending_verification: 'bg-yellow-500/20 text-yellow-400',
  completed: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
}
