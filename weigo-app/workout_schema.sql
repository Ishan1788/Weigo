-- Workout sessions
create table public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null default 'Workout',
  notes text,
  started_at timestamptz default now(),
  completed_at timestamptz
);

-- Individual sets within a session
create table public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.workout_sessions(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_name text not null,
  set_number integer not null,
  reps integer,
  weight numeric(6,2),
  weight_unit text default 'kg',
  logged_at timestamptz default now()
);

-- RLS
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;

create policy "workout_sessions: own data" on public.workout_sessions for all using (auth.uid() = user_id);
create policy "workout_sets: own data" on public.workout_sets for all using (auth.uid() = user_id);
