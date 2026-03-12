-- Good Deeds Network - Core Database Schema
-- This script creates all the tables needed for the MVP

-- User Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  role text default 'volunteer' check (role in ('volunteer', 'organization', 'sponsor', 'admin')),
  bio text,
  impact_score integer default 0,
  total_tokens integer default 0,
  tasks_completed integer default 0,
  level integer default 1,
  location_city text,
  location_country text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Organizations Table
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  logo_url text,
  website text,
  org_type text,
  verified boolean default false,
  location_city text,
  location_country text,
  total_tasks_created integer default 0,
  total_impact_generated integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Sponsors Table
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  logo_url text,
  website text,
  sponsor_type text,
  total_tokens_funded integer default 0,
  total_campaigns integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tasks Table
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  sponsor_id uuid references public.sponsors(id) on delete set null,
  
  title text not null,
  description text not null,
  instructions text,
  category text not null check (category in ('park_cleanup', 'forest_cleanup', 'river_cleanup', 'community_help', 'environmental_building', 'wildlife_support')),
  difficulty text default 'medium' check (difficulty in ('easy', 'medium', 'hard', 'expert')),
  status text default 'available' check (status in ('available', 'active', 'pending_verification', 'completed', 'rejected')),
  
  latitude double precision not null,
  longitude double precision not null,
  location_name text,
  location_address text,
  
  token_reward integer default 10,
  impact_points integer default 5,
  
  estimated_trash_kg numeric(10,2),
  estimated_duration_minutes integer,
  
  max_participants integer default 1,
  current_participants integer default 0,
  times_completed integer default 0,
  
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Task Submissions Table
create table if not exists public.task_submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  
  status text default 'pending' check (status in ('pending', 'approved', 'rejected', 'manual_review')),
  
  before_photo_url text not null,
  before_latitude double precision,
  before_longitude double precision,
  before_timestamp timestamp with time zone default now(),
  
  after_photo_url text,
  after_latitude double precision,
  after_longitude double precision,
  after_timestamp timestamp with time zone,
  
  video_url text,
  
  ai_confidence_score numeric(5,2),
  ai_analysis jsonb,
  ai_trash_detected_before integer,
  ai_trash_detected_after integer,
  ai_estimated_kg_removed numeric(10,2),
  
  tokens_awarded integer default 0,
  impact_awarded integer default 0,
  
  reviewed_by uuid references public.profiles(id),
  review_notes text,
  reviewed_at timestamp with time zone,
  
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Badges Table
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon_url text,
  category text,
  requirement_type text,
  requirement_value integer default 1,
  created_at timestamp with time zone default now()
);

-- User Badges
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  awarded_at timestamp with time zone default now(),
  unique(user_id, badge_id)
);

-- Challenges Table
create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  organization_id uuid references public.organizations(id) on delete set null,
  sponsor_id uuid references public.sponsors(id) on delete set null,
  
  title text not null,
  description text not null,
  image_url text,
  
  target_kg numeric(10,2),
  current_kg numeric(10,2) default 0,
  target_tasks integer,
  current_tasks integer default 0,
  
  bonus_tokens integer default 0,
  
  starts_at timestamp with time zone default now(),
  ends_at timestamp with time zone not null,
  
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Challenge Participants
create table if not exists public.challenge_participants (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.challenges(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  contribution_kg numeric(10,2) default 0,
  tasks_completed integer default 0,
  joined_at timestamp with time zone default now(),
  unique(challenge_id, user_id)
);

-- Token Transactions
create table if not exists public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  amount integer not null,
  transaction_type text not null,
  description text,
  related_task_id uuid references public.tasks(id) on delete set null,
  related_challenge_id uuid references public.challenges(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- Global Stats Table
create table if not exists public.global_stats (
  id uuid primary key default gen_random_uuid(),
  total_tasks_completed integer default 0,
  total_trash_kg numeric(15,2) default 0,
  total_volunteers integer default 0,
  total_tokens_distributed integer default 0,
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.sponsors enable row level security;
alter table public.tasks enable row level security;
alter table public.task_submissions enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_participants enable row level security;
alter table public.token_transactions enable row level security;
alter table public.global_stats enable row level security;
