-- Triggers for Good Deeds Network

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'volunteer'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', null)
  )
  on conflict (id) do nothing;

  -- Increment global volunteer count
  update public.global_stats
  set total_volunteers = total_volunteers + 1,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Update profile updated_at on change
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at();

drop trigger if exists organizations_updated_at on public.organizations;
create trigger organizations_updated_at
  before update on public.organizations
  for each row
  execute function public.update_updated_at();

drop trigger if exists sponsors_updated_at on public.sponsors;
create trigger sponsors_updated_at
  before update on public.sponsors
  for each row
  execute function public.update_updated_at();

drop trigger if exists tasks_updated_at on public.tasks;
create trigger tasks_updated_at
  before update on public.tasks
  for each row
  execute function public.update_updated_at();

-- Update global stats when task is completed
create or replace function public.update_global_stats_on_submission()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.status = 'approved' and (old.status is null or old.status != 'approved') then
    update public.global_stats
    set total_tasks_completed = total_tasks_completed + 1,
        total_trash_kg = total_trash_kg + coalesce(new.ai_estimated_kg_removed, 0),
        total_tokens_distributed = total_tokens_distributed + coalesce(new.tokens_awarded, 0),
        updated_at = now();
        
    -- Update user profile stats
    update public.profiles
    set tasks_completed = tasks_completed + 1,
        impact_score = impact_score + coalesce(new.impact_awarded, 0),
        total_tokens = total_tokens + coalesce(new.tokens_awarded, 0)
    where id = new.user_id;
    
    -- Update task completion count
    update public.tasks
    set times_completed = times_completed + 1
    where id = new.task_id;
  end if;
  
  return new;
end;
$$;

drop trigger if exists update_stats_on_submission on public.task_submissions;
create trigger update_stats_on_submission
  after insert or update on public.task_submissions
  for each row
  execute function public.update_global_stats_on_submission();
