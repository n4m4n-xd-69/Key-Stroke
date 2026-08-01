-- Keystroke — initial schema (PRD 04 §4, step 4)
--
-- Run in the Supabase SQL editor, or `supabase db push` with the CLI.
--
-- The anon key is inlined into the client bundle and is public by design. It is
-- safe ONLY because row-level security is enforced below. Verify RLS before
-- shipping: sign in as user A and attempt `select * from sessions` — it must
-- return A's rows and nothing else.

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users on delete cascade,
  display_name  text,
  goal_minutes  int  not null default 15,
  xp            int  not null default 0,
  streak_count  int  not null default 0,
  streak_best   int  not null default 0,
  streak_last   date,
  settings      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── sessions: append-only, one row per completed run ────────────────────────
-- `client_id` is an idempotency key minted on the device. The unique constraint
-- is what makes the sign-in adoption merge re-runnable without duplicating a
-- user's history.
create table if not exists public.sessions (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users on delete cascade,
  client_id    text not null,
  ts           timestamptz not null,
  kind         text not null,
  mode         text,
  language     text,
  difficulty   text,
  wpm          real not null,
  raw_wpm      real,
  accuracy     real not null,
  consistency  real,
  duration_sec real not null,
  chars        int,
  errors       int,
  xp           int not null default 0,
  created_at   timestamptz not null default now(),
  unique (user_id, client_id)
);
create index if not exists sessions_user_ts_idx on public.sessions (user_id, ts desc);

-- ── daily rollup: powers the heatmap without scanning sessions ──────────────
create table if not exists public.daily_stats (
  user_id  uuid not null references auth.users on delete cascade,
  day      date not null,
  seconds  int  not null default 0,
  sessions int  not null default 0,
  xp       int  not null default 0,
  primary key (user_id, day)
);

-- ── per-key accuracy ────────────────────────────────────────────────────────
create table if not exists public.key_stats (
  user_id uuid not null references auth.users on delete cascade,
  key     text not null,
  total   int  not null default 0,
  wrong   int  not null default 0,
  primary key (user_id, key)
);

-- ── learn progress ──────────────────────────────────────────────────────────
create table if not exists public.learn_progress (
  user_id    uuid not null references auth.users on delete cascade,
  module_id  text not null,
  passed     boolean not null default false,
  score      real,
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

-- ── problem attempts (PRD 01) ───────────────────────────────────────────────
create table if not exists public.problem_progress (
  user_id    uuid not null references auth.users on delete cascade,
  problem_id text not null,
  status     text not null default 'attempted',
  attempts   int  not null default 0,
  solved_at  timestamptz,
  language   text,
  updated_at timestamptz not null default now(),
  primary key (user_id, problem_id)
);

-- ── achievements ────────────────────────────────────────────────────────────
create table if not exists public.achievements (
  user_id     uuid not null references auth.users on delete cascade,
  achievement text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement)
);

-- ── row-level security ──────────────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.sessions         enable row level security;
alter table public.daily_stats      enable row level security;
alter table public.key_stats        enable row level security;
alter table public.learn_progress   enable row level security;
alter table public.problem_progress enable row level security;
alter table public.achievements     enable row level security;

drop policy if exists "own rows" on public.profiles;
create policy "own rows" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own rows" on public.sessions;
create policy "own rows" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.daily_stats;
create policy "own rows" on public.daily_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.key_stats;
create policy "own rows" on public.key_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.learn_progress;
create policy "own rows" on public.learn_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.problem_progress;
create policy "own rows" on public.problem_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own rows" on public.achievements;
create policy "own rows" on public.achievements
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── a profile row for every new user ────────────────────────────────────────
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
