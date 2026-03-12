-- Row Level Security Policies for Good Deeds Network

-- Profiles Policies
create policy "profiles_select_public" on public.profiles 
  for select using (true); -- Anyone can view profiles

create policy "profiles_insert_own" on public.profiles 
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles 
  for update using (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles 
  for delete using (auth.uid() = id);

-- Organizations Policies
create policy "organizations_select_public" on public.organizations 
  for select using (true);

create policy "organizations_insert_own" on public.organizations 
  for insert with check (auth.uid() = owner_id);

create policy "organizations_update_own" on public.organizations 
  for update using (auth.uid() = owner_id);

create policy "organizations_delete_own" on public.organizations 
  for delete using (auth.uid() = owner_id);

-- Sponsors Policies
create policy "sponsors_select_public" on public.sponsors 
  for select using (true);

create policy "sponsors_insert_own" on public.sponsors 
  for insert with check (auth.uid() = owner_id);

create policy "sponsors_update_own" on public.sponsors 
  for update using (auth.uid() = owner_id);

create policy "sponsors_delete_own" on public.sponsors 
  for delete using (auth.uid() = owner_id);

-- Tasks Policies
create policy "tasks_select_public" on public.tasks 
  for select using (true);

create policy "tasks_insert_authenticated" on public.tasks 
  for insert with check (auth.uid() = created_by);

create policy "tasks_update_creator" on public.tasks 
  for update using (auth.uid() = created_by);

create policy "tasks_delete_creator" on public.tasks 
  for delete using (auth.uid() = created_by);

-- Task Submissions Policies
create policy "submissions_select_own_or_public" on public.task_submissions 
  for select using (
    auth.uid() = user_id OR 
    status = 'approved'
  );

create policy "submissions_insert_own" on public.task_submissions 
  for insert with check (auth.uid() = user_id);

create policy "submissions_update_own" on public.task_submissions 
  for update using (auth.uid() = user_id);

-- Badges Policies
create policy "badges_select_public" on public.badges 
  for select using (true);

-- User Badges Policies
create policy "user_badges_select_public" on public.user_badges 
  for select using (true);

create policy "user_badges_insert_system" on public.user_badges 
  for insert with check (auth.uid() = user_id);

-- Challenges Policies
create policy "challenges_select_public" on public.challenges 
  for select using (true);

create policy "challenges_insert_authenticated" on public.challenges 
  for insert with check (auth.uid() = created_by);

create policy "challenges_update_creator" on public.challenges 
  for update using (auth.uid() = created_by);

-- Challenge Participants Policies
create policy "challenge_participants_select_public" on public.challenge_participants 
  for select using (true);

create policy "challenge_participants_insert_own" on public.challenge_participants 
  for insert with check (auth.uid() = user_id);

create policy "challenge_participants_update_own" on public.challenge_participants 
  for update using (auth.uid() = user_id);

-- Token Transactions Policies
create policy "token_transactions_select_own" on public.token_transactions 
  for select using (auth.uid() = user_id);

create policy "token_transactions_insert_own" on public.token_transactions 
  for insert with check (auth.uid() = user_id);

-- Global Stats Policies
create policy "global_stats_select_public" on public.global_stats 
  for select using (true);
