-- Keystroke — admin panel schema (PRD 05)
--
-- Depends on 0001_init.sql. Run with `supabase db push`.
--
-- Role lives in the database, never in the client — see is_admin() below.
-- Client-side routing on /admin is a convenience only; every admin query is
-- independently enforced by RLS, so a non-admin who finds the URL sees an
-- empty panel, not someone else's data.

-- ── roles ───────────────────────────────────────────────────────────────────
do $$ begin
  create type public.app_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users on delete cascade,
  role    public.app_role not null default 'user'
);
alter table public.user_roles enable row level security;

-- SECURITY DEFINER so RLS policies elsewhere can call this without recursing
-- back into user_roles' own RLS.
create or replace function public.is_admin() returns boolean
language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

-- Read your own role; only an admin may read others'. No insert/update/delete
-- policy exists at all — promoting the first admin is a deliberate manual
-- step (SQL editor / `supabase db execute`), not a self-service flow.
drop policy if exists "read own role" on public.user_roles;
create policy "read own role" on public.user_roles
  for select using (auth.uid() = user_id or public.is_admin());

-- ── admin read access on every 0001 table ────────────────────────────────────
-- "own rows" (0001) already lets a user read their own data; this adds a
-- second, additive policy so an admin can read everyone's. Postgres RLS ORs
-- policies of the same command together, so neither policy weakens the other.
drop policy if exists "admins read all" on public.profiles;
create policy "admins read all" on public.profiles for select using (public.is_admin());

drop policy if exists "admins read all" on public.sessions;
create policy "admins read all" on public.sessions for select using (public.is_admin());

drop policy if exists "admins read all" on public.daily_stats;
create policy "admins read all" on public.daily_stats for select using (public.is_admin());

drop policy if exists "admins read all" on public.key_stats;
create policy "admins read all" on public.key_stats for select using (public.is_admin());

drop policy if exists "admins read all" on public.learn_progress;
create policy "admins read all" on public.learn_progress for select using (public.is_admin());

drop policy if exists "admins read all" on public.problem_progress;
create policy "admins read all" on public.problem_progress for select using (public.is_admin());

drop policy if exists "admins read all" on public.achievements;
create policy "admins read all" on public.achievements for select using (public.is_admin());

-- ── auth events ─────────────────────────────────────────────────────────────
create table if not exists public.auth_events (
  id         bigint generated always as identity primary key,
  user_id    uuid references auth.users on delete set null,
  event      text not null,          -- signup | login | logout | failed | admin_view
  provider   text,                   -- email | google
  created_at timestamptz not null default now()
);
create index if not exists auth_events_created_idx on public.auth_events (created_at desc);
create index if not exists auth_events_user_created_idx on public.auth_events (user_id, created_at desc);

alter table public.auth_events enable row level security;

-- A user may log their own event (signup/login/logout/admin_view all happen
-- with a live session). A *failed* login has no session by definition, so it
-- is the one case allowed through with no user_id — scoped narrowly to that
-- one event value, not a general anonymous-insert hole. This is the same
-- "client-reported, advisory" trade-off PRD 05 §5 makes explicit for ai_usage.
drop policy if exists "insert own or anon-failed" on public.auth_events;
create policy "insert own or anon-failed" on public.auth_events
  for insert
  with check ((auth.uid() = user_id) or (user_id is null and event = 'failed'));

drop policy if exists "admins read all" on public.auth_events;
create policy "admins read all" on public.auth_events for select using (public.is_admin());

-- ── AI usage ────────────────────────────────────────────────────────────────
create table if not exists public.ai_usage (
  id            bigint generated always as identity primary key,
  user_id       uuid references auth.users on delete set null,
  surface       text not null,       -- chat | sidebar | passage | snippet | insight
  provider      text not null,       -- hcnsec | openrouter
  model         text not null,
  prompt_tokens int,
  output_tokens int,
  latency_ms    int,
  ok            boolean not null default true,
  reason        text,                -- failure reason when ok = false
  created_at    timestamptz not null default now()
);
create index if not exists ai_usage_created_idx on public.ai_usage (created_at desc);
create index if not exists ai_usage_user_created_idx on public.ai_usage (user_id, created_at desc);

alter table public.ai_usage enable row level security;

-- v1, client-reported (ai-runner.js writes this after every call): a signed-in
-- user may insert a row for themselves. Numbers are advisory — a malicious
-- client could misreport its own usage. Move behind an Edge Function proxy
-- (PRD 04 §9) before this matters for billing, and drop this insert policy
-- entirely once the function is the only writer (PRD 05 §5, v2).
drop policy if exists "insert own" on public.ai_usage;
create policy "insert own" on public.ai_usage for insert with check (auth.uid() = user_id);

drop policy if exists "admins read all" on public.ai_usage;
create policy "admins read all" on public.ai_usage for select using (public.is_admin());

-- ── aggregations ──────────────────────────────────────────────────────────
--
-- admin_daily is a plain security_invoker view: it only touches public.*
-- tables, so the "admins read all" policy above is enough to gate it per
-- caller, the same way it gates a direct select.
--
-- admin_user_overview is NOT a view. It joins auth.users, which the
-- `authenticated` role has no grant on by default in Supabase — a
-- security_invoker view would fail that join for every caller, admin or not,
-- and the alternative (granting select on auth.users to `authenticated`)
-- would hand every signed-in user everyone's email. A SECURITY DEFINER
-- function runs with the privilege to make that join, and the `where
-- public.is_admin()` guard is what keeps a non-admin caller getting zero
-- rows back instead of an error — "an empty panel", per PRD 05 §4.
create or replace function public.admin_user_overview()
returns table (
  id uuid,
  display_name text,
  email text,
  signed_up timestamptz,
  last_seen timestamptz,
  xp int,
  streak_count int,
  streak_best int,
  sessions bigint,
  total_seconds bigint,
  ai_calls bigint,
  ai_tokens bigint
)
language sql security definer stable set search_path = '' as $$
  select
    p.id,
    p.display_name,
    u.email,
    u.created_at                          as signed_up,
    u.last_sign_in_at                     as last_seen,
    p.xp, p.streak_count, p.streak_best,
    coalesce(s.session_count, 0)          as sessions,
    coalesce(s.total_seconds, 0)          as total_seconds,
    coalesce(a.ai_calls, 0)               as ai_calls,
    coalesce(a.ai_tokens, 0)              as ai_tokens
  from public.profiles p
  join auth.users u on u.id = p.id
  left join lateral (
    select count(*) session_count, sum(duration_sec)::int total_seconds
    from public.sessions where user_id = p.id
  ) s on true
  left join lateral (
    select count(*) ai_calls,
           sum(coalesce(prompt_tokens, 0) + coalesce(output_tokens, 0)) ai_tokens
    from public.ai_usage where user_id = p.id
  ) a on true
  where public.is_admin();
$$;

create or replace view public.admin_daily
with (security_invoker = on) as
select day,
       count(distinct user_id)          as active_users,
       sum(seconds)                     as seconds,
       sum(sessions)                    as sessions
from public.daily_stats
where public.is_admin()
group by day
order by day desc;

-- ── promoting the first admin ────────────────────────────────────────────────
-- No self-service path exists, by design (PRD 05 §4). Once you have a real
-- confirmed account, run in the SQL editor:
--
--   insert into public.user_roles (user_id, role)
--   values ('<your-auth-user-uuid>', 'admin');
