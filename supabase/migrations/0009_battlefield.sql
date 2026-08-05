-- Battlefield — multiplayer typing contest (PRD-BATTLEFIELD).
--
-- Depends on 0001 (profiles, RLS shape) and 0002 (is_admin). Run with
-- `supabase db push`.
--
-- Two things make this file different from every migration before it, and both
-- are deliberate:
--
--   1. Cross-user reads. Every policy in 0001-0008 is `auth.uid() = user_id`.
--      A Battlefield needs eight people to see each other's rows, scoped to the
--      room they share. `in_battle()` below is that scope, and it is SECURITY
--      DEFINER for exactly the reason `is_admin()` (0002) is: a policy on
--      battle_players that read battle_players would re-enter itself.
--
--   2. No direct writes. battle_rooms and battle_results have no insert/update
--      policy at all, and battle_players has exactly one narrow update policy.
--      Every other mutation is a SECURITY DEFINER function. With no backend to
--      put in front of the database (the app is a static Vite bundle), plpgsql
--      is the only trusted compute available — so the RPCs *are* the API, and
--      leaving no client-side write path is what makes that true by
--      construction rather than by convention.

/* ── rooms ──────────────────────────────────────────────────────────────── */

create table if not exists public.battle_rooms (
  id             uuid primary key default gen_random_uuid(),
  pin            text not null,
  admin_id       uuid not null references auth.users on delete cascade,
  status         text not null default 'lobby'
                   check (status in ('lobby','countdown','active','finished','aborted','expired')),
  max_players    int  not null default 8 check (max_players between 2 and 8),

  -- The passage itself lives in battle_passages, not here: this row is readable
  -- by every member from the moment they join, and a lobby-sitter who could
  -- read the text a minute before the countdown would have a decisive and
  -- completely invisible advantage. Only its length is here, because the
  -- progress bar and the plausibility floor both need the number and neither
  -- needs the words.
  passage_chars  int  not null,
  passage_meta   text,
  difficulty     text not null default 'normal',
  time_limit_sec int  not null default 180 check (time_limit_sec between 30 and 900),

  -- Set by battle_start(), inside Postgres. Every countdown and every duration
  -- measurement anchors here. Neither is reachable from a browser, which is
  -- what makes the recomputed WPM in battle_finish() worth anything.
  starts_at      timestamptz,
  deadline_at    timestamptz,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  expires_at     timestamptz not null default now() + interval '30 minutes'
);

-- The PIN is the join credential, so uniqueness is a constraint rather than a
-- hopeful check in application code. Partial, over live rooms only: a finished
-- room's code is free to be reissued, which keeps the space from silting up.
create unique index if not exists battle_rooms_pin_live_uniq
  on public.battle_rooms (pin)
  where status in ('lobby','countdown','active');

create index if not exists battle_rooms_admin_idx on public.battle_rooms (admin_id);
create index if not exists battle_rooms_reap_idx  on public.battle_rooms (expires_at)
  where status in ('lobby','countdown','active');

/* ── the passage ────────────────────────────────────────────────────────── */

create table if not exists public.battle_passages (
  room_id uuid primary key references public.battle_rooms on delete cascade,
  passage text not null
);

/* ── roster ─────────────────────────────────────────────────────────────── */

create table if not exists public.battle_players (
  room_id        uuid not null references public.battle_rooms on delete cascade,
  user_id        uuid not null references auth.users on delete cascade,

  -- Snapshotted at join rather than joined at read time. `profiles` is readable
  -- by its owner (0001) and by admins (0002); a room-mate is neither, and
  -- loosening that policy to render a roster would expose goal settings and
  -- streak history to strangers. Copying the two display fields is the narrow
  -- alternative — and they are the same two `public.leaderboard` (0007) already
  -- shows the whole world.
  display_name   text,
  avatar         text,

  is_admin       boolean not null default false,
  joined_at      timestamptz not null default now(),
  left_at        timestamptz,

  -- Durable checkpoint. The 2 Hz stream is Broadcast and never touches Postgres;
  -- this is written every few seconds so a reload mid-race has a floor to
  -- resume from.
  progress_chars int  not null default 0,
  wpm            real not null default 0,
  accuracy       real not null default 100,
  mistakes       int  not null default 0,

  status         text not null default 'waiting'
                   check (status in ('waiting','racing','finished','forfeit','disconnected')),

  primary key (room_id, user_id)
);

create index if not exists battle_players_user_idx on public.battle_players (user_id);

/* ── results ────────────────────────────────────────────────────────────── */
-- Append-only and immutable. Separate from battle_players because the roster row
-- mutates all race long and a result must not.

create table if not exists public.battle_results (
  room_id       uuid not null references public.battle_rooms on delete cascade,
  user_id       uuid not null references auth.users on delete cascade,

  display_name  text,
  avatar        text,

  correct_chars int  not null,
  typed_chars   int  not null,
  mistakes      int  not null,
  accuracy      real not null,
  consistency   real,

  -- `wpm` is recomputed in battle_finish() from correct_chars and the
  -- server-measured elapsed time; `client_wpm` keeps what the browser claimed,
  -- purely so a divergence is visible in the data rather than silently
  -- discarded. Ranking uses `wpm`.
  wpm           real not null,
  client_wpm    real,

  finished      boolean not null default true,
  finished_at   timestamptz,
  duration_sec  real not null,

  rank          int,
  flags         text[] not null default '{}',
  created_at    timestamptz not null default now(),

  primary key (room_id, user_id)
);

create index if not exists battle_results_user_idx on public.battle_results (user_id, created_at desc);

/* ── scope helpers ──────────────────────────────────────────────────────── */
-- SECURITY DEFINER so the policies below can call them without re-entering the
-- RLS they are themselves evaluating. Same reasoning as is_admin() in 0002.

create or replace function public.in_battle(room uuid) returns boolean
language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.battle_players
     where room_id = room and user_id = auth.uid()
  );
$$;

create or replace function public.is_battle_admin(room uuid) returns boolean
language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.battle_rooms
     where id = room and admin_id = auth.uid()
  );
$$;

create or replace function public.battle_started(room uuid) returns boolean
language sql security definer stable set search_path = '' as $$
  select exists (
    select 1 from public.battle_rooms
     where id = room and status in ('countdown','active','finished')
  );
$$;

/* ── row-level security ─────────────────────────────────────────────────── */

alter table public.battle_rooms    enable row level security;
alter table public.battle_passages enable row level security;
alter table public.battle_players  enable row level security;
alter table public.battle_results  enable row level security;

-- Rooms: members read. Deliberately NOT "anyone who knows the PIN" — a client
-- able to select by pin could walk the code space and harvest live rooms.
-- Joining goes through battle_join(), which is SECURITY DEFINER and can see
-- rooms the caller cannot.
drop policy if exists "members read" on public.battle_rooms;
create policy "members read" on public.battle_rooms
  for select using (public.in_battle(id) or admin_id = auth.uid());

drop policy if exists "admins read all" on public.battle_rooms;
create policy "admins read all" on public.battle_rooms for select using (public.is_admin());

-- The passage appears only once the countdown has started. This is the whole
-- point of the separate table.
drop policy if exists "members read after start" on public.battle_passages;
create policy "members read after start" on public.battle_passages
  for select using (public.in_battle(room_id) and public.battle_started(room_id));

drop policy if exists "members read" on public.battle_players;
create policy "members read" on public.battle_players
  for select using (public.in_battle(room_id));

-- The one direct write a client gets: your own progress, and only while the room
-- is running. Joining, leaving, finishing and being kicked are all RPCs, because
-- each carries a check the client cannot be trusted to run on itself.
drop policy if exists "own progress" on public.battle_players;
create policy "own progress" on public.battle_players
  for update using (
    user_id = auth.uid()
    and exists (select 1 from public.battle_rooms r
                 where r.id = room_id and r.status in ('countdown','active'))
  );

drop policy if exists "admins read all" on public.battle_players;
create policy "admins read all" on public.battle_players for select using (public.is_admin());

drop policy if exists "members read" on public.battle_results;
create policy "members read" on public.battle_results
  for select using (public.in_battle(room_id));

drop policy if exists "admins read all" on public.battle_results;
create policy "admins read all" on public.battle_results for select using (public.is_admin());

/* ── server clock ───────────────────────────────────────────────────────── */
-- Load-bearing despite being one line. Browser clocks drift by seconds; without
-- a shared reference "everyone starts together" is unimplementable.

create or replace function public.battle_server_time() returns timestamptz
language sql stable set search_path = '' as $$ select now(); $$;

/* ── PIN minting ────────────────────────────────────────────────────────── */
-- 30 symbols: no 0/O, no 1/I/L, no U. The first two pairs are what people
-- misread off a screen; U is dropped so the generator cannot spell something
-- unfortunate. 30^6 ≈ 729M live combinations.

create or replace function public.battle_mint_pin() returns text
language plpgsql security definer set search_path = '' as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  candidate text;
  i int;
  j int;
begin
  for i in 1..12 loop
    candidate := '';
    for j in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    if not exists (
      select 1 from public.battle_rooms
       where pin = candidate and status in ('lobby','countdown','active')
    ) then
      return candidate;
    end if;
  end loop;
  raise exception 'Could not mint a unique room code' using errcode = 'BF009';
end; $$;

/* ── janitor ────────────────────────────────────────────────────────────── */
-- pg_cron is not enabled on this project, so this is called opportunistically
-- from create and join. At current scale that is easily often enough; wire it to
-- a schedule before real traffic.

create or replace function public.battle_reap() returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.battle_rooms
     set status = 'expired', updated_at = now()
   where status = 'lobby' and expires_at < now();

  update public.battle_rooms
     set status = 'aborted', updated_at = now()
   where status = 'countdown' and starts_at < now() - interval '60 seconds';

  -- A race whose deadline passed is over, whoever is still connected.
  update public.battle_rooms
     set status = 'finished', updated_at = now()
   where status = 'active' and deadline_at < now();

  delete from public.battle_rooms
   where status in ('finished','aborted','expired')
     and updated_at < now() - interval '7 days';
end; $$;

/* ── create ─────────────────────────────────────────────────────────────── */

create or replace function public.battle_create(
  p_passage        text,
  p_passage_meta   text default null,
  p_difficulty     text default 'normal',
  p_max_players    int  default 8,
  p_time_limit_sec int  default 180
) returns public.battle_rooms
language plpgsql security definer set search_path = '' as $$
declare
  r    public.battle_rooms;
  uid  uuid := auth.uid();
  live int;
begin
  if uid is null then
    raise exception 'Sign in to open a Battlefield' using errcode = 'BF000';
  end if;
  if p_passage is null or length(p_passage) < 40 or length(p_passage) > 4000 then
    raise exception 'That passage is not a usable length' using errcode = 'BF008';
  end if;
  if p_max_players < 2 or p_max_players > 8 then
    raise exception 'A Battlefield holds 2 to 8 players' using errcode = 'BF007';
  end if;

  perform public.battle_reap();

  select count(*) into live from public.battle_rooms
   where admin_id = uid and status in ('lobby','countdown','active');
  if live >= 3 then
    raise exception 'You already have 3 Battlefields open' using errcode = 'BF010';
  end if;

  insert into public.battle_rooms (
    pin, admin_id, max_players, passage_chars, passage_meta, difficulty, time_limit_sec
  ) values (
    public.battle_mint_pin(), uid, p_max_players, length(p_passage),
    p_passage_meta, coalesce(p_difficulty, 'normal'), p_time_limit_sec
  ) returning * into r;

  insert into public.battle_passages (room_id, passage) values (r.id, p_passage);

  -- The admin joins their own room in the same transaction. A room whose host is
  -- not on the roster is not a state worth being able to reach.
  insert into public.battle_players (room_id, user_id, display_name, avatar, is_admin)
  select r.id, uid, p.display_name, p.avatar, true
    from public.profiles p where p.id = uid;

  -- No profile row yet (a brand-new guest) still gets a roster row.
  if not found then
    insert into public.battle_players (room_id, user_id, display_name, is_admin)
    values (r.id, uid, 'Player', true);
  end if;

  return r;
end; $$;

/* ── join ───────────────────────────────────────────────────────────────── */
-- Every join rule lives here, in one transaction, so none of them can be raced.

create or replace function public.battle_join(p_pin text)
returns public.battle_rooms
language plpgsql security definer set search_path = '' as $$
declare
  r   public.battle_rooms;
  uid uuid := auth.uid();
  n   int;
begin
  if uid is null then
    raise exception 'Sign in to join a Battlefield' using errcode = 'BF000';
  end if;

  perform public.battle_reap();

  -- FOR UPDATE is what makes the capacity check correct. Without the row lock
  -- two people joining a 7/8 room both read 7, both pass, and the room ends up
  -- with 9 players.
  select * into r from public.battle_rooms
   where pin = upper(btrim(p_pin))
     and status in ('lobby','countdown','active')
   for update;

  if not found then
    raise exception 'No Battlefield with that code' using errcode = 'BF001';
  end if;

  -- Already in: a success, not an error. This is the refresh path and the
  -- double-tap path, and both should land you in the room.
  if exists (select 1 from public.battle_players
              where room_id = r.id and user_id = uid and left_at is null) then
    return r;
  end if;

  if r.status <> 'lobby' then
    raise exception 'That match has already started' using errcode = 'BF004';
  end if;

  select count(*) into n from public.battle_players
   where room_id = r.id and left_at is null;
  if n >= r.max_players then
    raise exception 'That Battlefield is full' using errcode = 'BF003';
  end if;

  insert into public.battle_players (room_id, user_id, display_name, avatar)
  select r.id, uid, coalesce(nullif(btrim(p.display_name), ''), 'Player'), p.avatar
    from public.profiles p where p.id = uid
  on conflict (room_id, user_id) do update
     set left_at = null, joined_at = now(), status = 'waiting';

  if not found then
    insert into public.battle_players (room_id, user_id, display_name)
    values (r.id, uid, 'Player')
    on conflict (room_id, user_id) do update
       set left_at = null, joined_at = now(), status = 'waiting';
  end if;

  update public.battle_rooms
     set updated_at = now(), expires_at = now() + interval '30 minutes'
   where id = r.id returning * into r;

  return r;
end; $$;

/* ── leave, with succession ─────────────────────────────────────────────── */

create or replace function public.battle_leave(p_room uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  r    public.battle_rooms;
  uid  uuid := auth.uid();
  me   public.battle_players;
  heir uuid;
begin
  select * into r from public.battle_rooms where id = p_room for update;
  if not found then return; end if;

  select * into me from public.battle_players
   where room_id = p_room and user_id = uid;
  if not found then return; end if;

  update public.battle_players
     set left_at = now(),
         status = case when r.status = 'active' then 'forfeit' else status end
   where room_id = p_room and user_id = uid;

  -- Mid-race departure is a forfeit, recorded with whatever they had typed.
  if r.status in ('countdown','active') then
    insert into public.battle_results (
      room_id, user_id, display_name, avatar, correct_chars, typed_chars,
      mistakes, accuracy, wpm, client_wpm, finished, finished_at, duration_sec, flags
    ) values (
      p_room, uid, me.display_name, me.avatar, me.progress_chars, me.progress_chars,
      me.mistakes, me.accuracy, me.wpm, me.wpm, false, null,
      greatest(0, extract(epoch from (now() - coalesce(r.starts_at, now())))),
      array['left']::text[]
    ) on conflict (room_id, user_id) do nothing;
  end if;

  -- Succession. Admin powers only matter in the lobby, so a host leaving a live
  -- race changes nothing; a host leaving a lobby hands over to whoever has been
  -- waiting longest, and closes the room only if nobody is left.
  if r.admin_id = uid then
    select user_id into heir from public.battle_players
     where room_id = p_room and left_at is null and user_id <> uid
     order by joined_at asc limit 1;

    if heir is null then
      if r.status = 'lobby' then
        update public.battle_rooms set status = 'aborted', updated_at = now() where id = p_room;
      end if;
    else
      update public.battle_rooms set admin_id = heir, updated_at = now() where id = p_room;
      update public.battle_players set is_admin = true where room_id = p_room and user_id = heir;
    end if;
  end if;

  perform public.battle_maybe_settle(p_room);
end; $$;

/* ── kick ───────────────────────────────────────────────────────────────── */

create or replace function public.battle_kick(p_room uuid, p_user uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_battle_admin(p_room) then
    raise exception 'Only the host can remove players' using errcode = 'BF005';
  end if;
  if not exists (select 1 from public.battle_rooms where id = p_room and status = 'lobby') then
    raise exception 'Players can only be removed before the match starts' using errcode = 'BF011';
  end if;
  if p_user = auth.uid() then
    raise exception 'Use leave instead' using errcode = 'BF012';
  end if;

  update public.battle_players set left_at = now()
   where room_id = p_room and user_id = p_user;
end; $$;

/* ── start ──────────────────────────────────────────────────────────────── */

create or replace function public.battle_start(p_room uuid)
returns public.battle_rooms
language plpgsql security definer set search_path = '' as $$
declare
  r public.battle_rooms;
  n int;
begin
  select * into r from public.battle_rooms where id = p_room for update;
  if not found then
    raise exception 'No such Battlefield' using errcode = 'BF001';
  end if;
  if r.admin_id <> auth.uid() then
    raise exception 'Only the host can start the match' using errcode = 'BF005';
  end if;

  -- Idempotent: a double-click must not restart the countdown window.
  if r.status in ('countdown','active') then
    return r;
  end if;
  if r.status <> 'lobby' then
    raise exception 'That match is over' using errcode = 'BF013';
  end if;

  select count(*) into n from public.battle_players
   where room_id = p_room and left_at is null;
  if n < 2 then
    raise exception 'You need at least one opponent' using errcode = 'BF006';
  end if;

  -- 3.5s, not 3. The visible countdown is three beats; the extra half second is
  -- propagation budget, so the earliest client to receive this cannot start
  -- before the slowest has even been told.
  update public.battle_rooms
     set status      = 'countdown',
         starts_at   = now() + interval '3.5 seconds',
         deadline_at = now() + interval '3.5 seconds' + make_interval(secs => r.time_limit_sec + 15),
         updated_at  = now()
   where id = p_room
   returning * into r;

  update public.battle_players set status = 'racing'
   where room_id = p_room and left_at is null;

  return r;
end; $$;

/* ── the lazy countdown -> active flip ──────────────────────────────────── */
-- Nobody owns this transition explicitly; there is no timer process to own it.
-- starts_at is the authority, and the first client past it writes the status so
-- that anyone loading the room cold sees the truth.

create or replace function public.battle_touch(p_room uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.battle_rooms
     set status = 'active', updated_at = now()
   where id = p_room and status = 'countdown' and starts_at <= now();
end; $$;

/* ── settle ─────────────────────────────────────────────────────────────── */
-- Ranking is materialised rather than computed per read so that every client,
-- and every later look at the match, sees one ordering. Same reasoning
-- public.leaderboard (0005) gives for computing rank() in the view.

create or replace function public.battle_settle(p_room uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  update public.battle_rooms
     set status = 'finished', updated_at = now()
   where id = p_room and status in ('countdown','active');

  with ranked as (
    select user_id,
           row_number() over (
             order by (finished_at is null),                                    -- finishers first
                      case when finished_at is null then -correct_chars else 0 end,
                      mistakes asc,                                             -- 1. fewest mistakes
                      wpm desc,                                                 -- 2. highest WPM
                      accuracy desc,                                            -- 3. highest accuracy
                      finished_at asc                                           -- 4. earliest finish
           ) as rnk
      from public.battle_results
     where room_id = p_room
  )
  update public.battle_results r
     set rank = ranked.rnk
    from ranked
   where r.room_id = p_room and r.user_id = ranked.user_id;
end; $$;

/* Settles only once every player who is still in the room has a result. */
create or replace function public.battle_maybe_settle(p_room uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare
  outstanding int;
begin
  select count(*) into outstanding
    from public.battle_players p
   where p.room_id = p_room
     and p.left_at is null
     and not exists (
       select 1 from public.battle_results r
        where r.room_id = p_room and r.user_id = p.user_id
     );

  if outstanding = 0 then
    perform public.battle_settle(p_room);
  end if;
end; $$;

/* ── finish ─────────────────────────────────────────────────────────────── */

create or replace function public.battle_finish(
  p_room          uuid,
  p_correct_chars int,
  p_typed_chars   int,
  p_mistakes      int,
  p_accuracy      real,
  p_consistency   real,
  p_client_wpm    real,
  p_finished      boolean default true
) returns public.battle_results
language plpgsql security definer set search_path = '' as $$
declare
  r        public.battle_rooms;
  me       public.battle_players;
  res      public.battle_results;
  uid      uuid := auth.uid();
  elapsed  double precision;
  correct  int;
  srv_wpm  real;
  fl       text[] := '{}';
begin
  select * into r from public.battle_rooms where id = p_room;
  if not found then
    raise exception 'No such Battlefield' using errcode = 'BF001';
  end if;
  if r.starts_at is null then
    raise exception 'That match has not started' using errcode = 'BF014';
  end if;

  select * into me from public.battle_players where room_id = p_room and user_id = uid;
  if not found then
    raise exception 'You are not in that Battlefield' using errcode = 'BF015';
  end if;

  -- The server owns the clock. starts_at was written by battle_start() inside
  -- Postgres and now() is Postgres's, so neither endpoint is reachable from a
  -- browser. This is the one number a cheating client cannot move.
  elapsed := greatest(1.0, extract(epoch from (now() - r.starts_at)));
  correct := greatest(0, least(coalesce(p_correct_chars, 0), r.passage_chars));

  -- The ::text casts are load-bearing. In `text[] || unknown` Postgres reads the
  -- bare literal as an *array* literal, so without them the first genuinely
  -- flagged run dies on `malformed array literal: "impossible-speed"` — which,
  -- being the cheat path, is exactly the branch nobody exercises by accident.
  if coalesce(p_correct_chars, 0) > r.passage_chars then
    fl := fl || 'over-length'::text;
  end if;

  -- 20 chars/sec ≈ 240 WPM sustained, comfortably past the world record for a
  -- passage of this length. Anything faster did not come from a keyboard.
  if elapsed < correct / 20.0 then
    fl := fl || 'impossible-speed'::text;
  end if;

  srv_wpm := (correct / 5.0) / (elapsed / 60.0);

  insert into public.battle_results (
    room_id, user_id, display_name, avatar,
    correct_chars, typed_chars, mistakes, accuracy, consistency,
    wpm, client_wpm, finished, finished_at, duration_sec, flags
  ) values (
    p_room, uid, me.display_name, me.avatar,
    correct, greatest(0, coalesce(p_typed_chars, 0)), greatest(0, coalesce(p_mistakes, 0)),
    least(100.0, greatest(0.0, coalesce(p_accuracy, 0))), p_consistency,
    srv_wpm, p_client_wpm, coalesce(p_finished, true),
    case when coalesce(p_finished, true) then now() else null end,
    elapsed, fl
  )
  -- Written once. A retried call after a flaky response cannot rewrite a result,
  -- and there is no update policy, so nothing can rewrite it later either.
  on conflict (room_id, user_id) do nothing
  returning * into res;

  if res.room_id is null then
    select * into res from public.battle_results where room_id = p_room and user_id = uid;
  end if;

  update public.battle_players
     set status = case when coalesce(p_finished, true) then 'finished' else 'forfeit' end,
         progress_chars = correct,
         wpm = srv_wpm,
         accuracy = least(100.0, greatest(0.0, coalesce(p_accuracy, 0))),
         mistakes = greatest(0, coalesce(p_mistakes, 0))
   where room_id = p_room and user_id = uid;

  perform public.battle_maybe_settle(p_room);

  return res;
end; $$;

/* ── abort ──────────────────────────────────────────────────────────────── */

create or replace function public.battle_abort(p_room uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_battle_admin(p_room) then
    raise exception 'Only the host can cancel the match' using errcode = 'BF005';
  end if;
  update public.battle_rooms
     set status = 'aborted', updated_at = now()
   where id = p_room and status in ('lobby','countdown');
end; $$;

/* ── reads ──────────────────────────────────────────────────────────────── */

/* Resolving a code to a room without granting a select-by-pin path. */
create or replace function public.battle_room_by_pin(p_pin text)
returns public.battle_rooms
language plpgsql security definer set search_path = '' as $$
declare
  r public.battle_rooms;
begin
  -- Both lines matter, and the coalesce is the subtle one. With no session
  -- `r.admin_id = auth.uid()` is NULL rather than false, so `not (false or
  -- NULL)` evaluates to NULL — which an IF treats as not-true, skipping the
  -- raise and returning the room. A signed-out caller read a finished room this
  -- way before the guard was written like this.
  if auth.uid() is null then
    raise exception 'Sign in to open a Battlefield' using errcode = 'BF000';
  end if;

  select * into r from public.battle_rooms
   where pin = upper(btrim(p_pin))
   order by created_at desc limit 1;

  if not found then
    raise exception 'No Battlefield with that code' using errcode = 'BF001';
  end if;
  if not (public.in_battle(r.id) or coalesce(r.admin_id = auth.uid(), false)) then
    raise exception 'Join that Battlefield first' using errcode = 'BF016';
  end if;
  return r;
end; $$;

create or replace function public.battle_passage(p_room uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  txt text;
begin
  if auth.uid() is null then
    raise exception 'Sign in first' using errcode = 'BF000';
  end if;
  if not public.in_battle(p_room) then
    raise exception 'You are not in that Battlefield' using errcode = 'BF015';
  end if;
  if not public.battle_started(p_room) then
    raise exception 'The match has not started' using errcode = 'BF014';
  end if;
  select passage into txt from public.battle_passages where room_id = p_room;
  return txt;
end; $$;

create or replace function public.battle_leaderboard(p_room uuid)
returns table (
  user_id       uuid,
  display_name  text,
  avatar        text,
  correct_chars int,
  mistakes      int,
  accuracy      real,
  consistency   real,
  wpm           real,
  finished      boolean,
  duration_sec  real,
  rank          int,
  flags         text[]
)
language sql security definer stable set search_path = '' as $$
  select r.user_id, r.display_name, r.avatar, r.correct_chars, r.mistakes,
         r.accuracy, r.consistency, r.wpm, r.finished, r.duration_sec, r.rank, r.flags
    from public.battle_results r
   where r.room_id = p_room
     and auth.uid() is not null
     and public.in_battle(p_room)
   order by
     coalesce(r.rank, 2147483647),
     (r.finished_at is null),
     r.mistakes asc, r.wpm desc, r.accuracy desc, r.finished_at asc;
$$;

/* ── grants ─────────────────────────────────────────────────────────────── */
-- anon gets nothing: Battlefield always needs a user row, guest or otherwise.
--
-- The REVOKE is the load-bearing half and it is easy to leave out. Postgres
-- grants EXECUTE on every newly created function to PUBLIC, so `grant ... to
-- authenticated` alone is purely additive and changes nothing — every RPC stays
-- callable signed-out. Verified: before this revoke, `set role anon` could call
-- battle_room_by_pin and get a room back.

revoke execute on function public.battle_server_time()                              from public, anon;
revoke execute on function public.battle_create(text, text, text, int, int)         from public, anon;
revoke execute on function public.battle_join(text)                                 from public, anon;
revoke execute on function public.battle_leave(uuid)                                from public, anon;
revoke execute on function public.battle_kick(uuid, uuid)                           from public, anon;
revoke execute on function public.battle_start(uuid)                                from public, anon;
revoke execute on function public.battle_touch(uuid)                                from public, anon;
revoke execute on function public.battle_finish(uuid, int, int, int, real, real, real, boolean) from public, anon;
revoke execute on function public.battle_abort(uuid)                                from public, anon;
revoke execute on function public.battle_room_by_pin(text)                          from public, anon;
revoke execute on function public.battle_passage(uuid)                              from public, anon;
revoke execute on function public.battle_leaderboard(uuid)                          from public, anon;
revoke execute on function public.in_battle(uuid)                                   from public, anon;
revoke execute on function public.is_battle_admin(uuid)                             from public, anon;
revoke execute on function public.battle_started(uuid)                              from public, anon;

-- These four are internal. They carry no permission check of their own because
-- they are only ever reached from inside battle_finish / battle_leave /
-- battle_create, which have already established who the caller is — so leaving
-- them executable would let any signed-in user call battle_settle(<room>) on a
-- match they are not in and force it to finish mid-race. A SECURITY DEFINER
-- function runs as its owner, so the inner calls do not need the caller to hold
-- EXECUTE; revoking from `authenticated` too costs nothing.
--
-- in_battle and battle_started are the exception and stay granted below: they
-- appear in RLS policy expressions, and evaluating a policy *does* require the
-- caller to hold EXECUTE (anon otherwise gets "permission denied for function
-- in_battle" on an ordinary select).
revoke execute on function public.battle_mint_pin()         from public, anon, authenticated;
revoke execute on function public.battle_reap()             from public, anon, authenticated;
revoke execute on function public.battle_settle(uuid)       from public, anon, authenticated;
revoke execute on function public.battle_maybe_settle(uuid) from public, anon, authenticated;

grant execute on function public.battle_server_time()                              to authenticated;
grant execute on function public.battle_create(text, text, text, int, int)         to authenticated;
grant execute on function public.battle_join(text)                                 to authenticated;
grant execute on function public.battle_leave(uuid)                                to authenticated;
grant execute on function public.battle_kick(uuid, uuid)                           to authenticated;
grant execute on function public.battle_start(uuid)                                to authenticated;
grant execute on function public.battle_touch(uuid)                                to authenticated;
grant execute on function public.battle_finish(uuid, int, int, int, real, real, real, boolean) to authenticated;
grant execute on function public.battle_abort(uuid)                                to authenticated;
grant execute on function public.battle_room_by_pin(text)                          to authenticated;
grant execute on function public.battle_passage(uuid)                              to authenticated;
grant execute on function public.battle_leaderboard(uuid)                          to authenticated;
grant execute on function public.in_battle(uuid)                                   to authenticated;
grant execute on function public.is_battle_admin(uuid)                             to authenticated;

/* ── realtime ───────────────────────────────────────────────────────────── */
-- The project's supabase_realtime publication was empty before this migration;
-- Battlefield is the first feature here to use realtime at all.
--
-- replica identity full ships the whole row in the WAL, which RLS needs in order
-- to evaluate a policy against a change event. Free on tables that hold eight
-- rows; do not copy this onto sessions.

alter table public.battle_rooms   replica identity full;
alter table public.battle_players replica identity full;
alter table public.battle_results replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.battle_rooms;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.battle_players;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.battle_results;
exception when duplicate_object then null; end $$;
