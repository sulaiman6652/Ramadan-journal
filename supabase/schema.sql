-- Ramadan Journal Database Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  ramadan_start_date text not null default '2026-02-17',
  created_at timestamp with time zone default timezone('utc', now())
);

-- Goals table
create table if not exists goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  goal_type text not null check (goal_type in ('divisible', 'weekly', 'daily', 'one_time', 'specific_days')),
  total_amount integer,
  weekly_frequency integer,
  weekly_days integer[],
  daily_amount integer,
  specific_days integer[],
  unit text not null default 'times',
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Daily tasks table
create table if not exists daily_tasks (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references goals on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  target_amount integer not null default 1,
  completed_amount integer not null default 0,
  is_completed boolean not null default false,
  carried_over_from text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Day completions table (tracks fully completed days)
create table if not exists day_completions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date text not null,
  completed_at timestamp with time zone default timezone('utc', now()),
  unique(user_id, date)
);

-- Create indexes for performance
create index if not exists idx_goals_user_id on goals(user_id);
create index if not exists idx_daily_tasks_user_id on daily_tasks(user_id);
create index if not exists idx_daily_tasks_date on daily_tasks(date);
create index if not exists idx_daily_tasks_goal_id on daily_tasks(goal_id);
create index if not exists idx_day_completions_user_id on day_completions(user_id);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table goals enable row level security;
alter table daily_tasks enable row level security;
alter table day_completions enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Goals policies
create policy "Users can view own goals"
  on goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on goals for delete
  using (auth.uid() = user_id);

-- Daily tasks policies
create policy "Users can view own tasks"
  on daily_tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on daily_tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on daily_tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on daily_tasks for delete
  using (auth.uid() = user_id);

-- Day completions policies
create policy "Users can view own day completions"
  on day_completions for select
  using (auth.uid() = user_id);

create policy "Users can insert own day completions"
  on day_completions for insert
  with check (auth.uid() = user_id);

-- Function to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, ramadan_start_date)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    '2026-02-17'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
