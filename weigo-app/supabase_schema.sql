-- Run this in your Supabase SQL editor to set up the database

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  goal_weight numeric(5,2),
  start_weight numeric(5,2),
  height_cm numeric(5,1),
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'other', null)),
  activity_level text,
  streak_days integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Weight logs
create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  weight numeric(5,2) not null,
  unit text default 'kg',
  notes text,
  logged_at timestamptz default now()
);

-- Body measurements
create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  waist numeric(5,1),
  hips numeric(5,1),
  chest numeric(5,1),
  left_arm numeric(5,1),
  right_arm numeric(5,1),
  left_thigh numeric(5,1),
  right_thigh numeric(5,1),
  measured_at timestamptz default now()
);

-- Food logs
create table public.food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  meal text not null check (meal in ('Breakfast', 'Lunch', 'Dinner', 'Snack')),
  name text not null,
  calories numeric(7,1) default 0,
  protein numeric(6,1) default 0,
  carbs numeric(6,1) default 0,
  fat numeric(6,1) default 0,
  created_at timestamptz default now()
);

-- Row Level Security (RLS) — critical for data privacy
alter table public.profiles enable row level security;
alter table public.weight_logs enable row level security;
alter table public.measurements enable row level security;
alter table public.food_logs enable row level security;

-- Policies: users can only read/write their own data
create policy "profiles: own data" on public.profiles for all using (auth.uid() = id);
create policy "weight_logs: own data" on public.weight_logs for all using (auth.uid() = user_id);
create policy "measurements: own data" on public.measurements for all using (auth.uid() = user_id);
create policy "food_logs: own data" on public.food_logs for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
