-- ================================================================
-- Migration: Add projects and tasks tables
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- ================================================================

-- 1. Create projects table
create table public.projects (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  color       text        not null default '#7c9ef8',
  description text,
  created_at  timestamptz not null default now()
);

-- 2. RLS for projects
alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- 3. Create tasks table
create table public.tasks (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users(id) on delete cascade,
  project_id          uuid        references public.projects(id) on delete set null,
  title               text        not null,
  estimated_pomodoros int         not null default 1,
  actual_pomodoros    int         not null default 0,
  completed           boolean     not null default false,
  created_at          timestamptz not null default now()
);

-- 4. RLS for tasks
alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

-- 5. Add task_id and project_id to pomodoro_sessions
alter table public.pomodoro_sessions
  add column if not exists task_id    uuid references public.tasks(id)    on delete set null,
  add column if not exists project_id uuid references public.projects(id) on delete set null;

-- 6. RPC: atomically increment actual_pomodoros
create or replace function public.increment_task_pomodoro(p_task_id uuid)
returns void
language sql
security invoker
as $$
  update public.tasks
  set actual_pomodoros = actual_pomodoros + 1
  where id = p_task_id;
$$;
