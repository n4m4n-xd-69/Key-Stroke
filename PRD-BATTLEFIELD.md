# PRD — Battlefield

**Multiplayer gamified typing contest for KeyStroke**

| | |
|---|---|
| **Status** | Draft — implementation-ready |
| **Author** | Engineering |
| **Date** | 2026-08-06 |
| **Depends on** | migrations `0001`–`0008`, `src/lib/auth.jsx`, `src/lib/supabase.js`, `src/components/typing/*` |
| **Introduces** | migration `0009_battlefield.sql`, route `/battle`, `src/lib/battle/*`, `src/modules/battle/*` |

> Migrations in this repo reference PRDs by number (`PRD 04 §4`, `PRD 05 §5`). Those
> documents are not checked in. If you keep that convention, renumber this file to the
> next free slot and update the `§` references in `0009` to match.

---

## 0. Read this first — the two facts that shape every decision below

Both were verified against the codebase and the live database, not assumed.

**0.1 — There is no backend.** KeyStroke is a static Vite SPA. `vercel.json` declares
`framework: vite`, `outputDirectory: dist`, and a single catch-all rewrite to
`index.html`. There is no `api/` directory, no `supabase/functions/`, and no server
process of any kind — `supabase/` contains `migrations/` and nothing else. Every byte of
logic that exists today runs in the user's browser.

The consequence for a competitive feature: **the only trusted compute available is
Postgres itself.** Anything that must not be forgeable has to live in a `SECURITY
DEFINER` function or an RLS policy. "Validate it on the server" means "write a plpgsql
function", not "write an endpoint". §11 and §14 are built around that constraint, and
§17 gives the migration path for when it stops being acceptable.

**0.2 — Realtime has never been used here.** A grep for `channel(`, `broadcast`,
`presence` and `realtime` across `src/` returns zero hits, and on the live project
(`psialluubadiehgwjfzy`) the `supabase_realtime` publication exists with **zero tables in
it**:

```
pubname            | tables
-------------------+--------
supabase_realtime  | (none)
```

So Battlefield is not extending a realtime layer — it is introducing the first one.
Broadcast and Presence work over WebSocket without publication membership; Postgres
Changes does not, and §9 specifies exactly which tables get added to the publication and
why.

---

## 1. Feature overview

Battlefield turns KeyStroke's single-player typing surface into a live race. One player
opens a room, shares a six-character PIN, up to eight people join, everyone gets the
*same* passage, a synchronised three-second countdown drops, and every player watches
every other player's WPM, accuracy, mistakes and progress move in real time. When the
last player finishes (or the room times out), a ranked leaderboard settles the match.

### Why it belongs in this product

KeyStroke already has the entire single-player loop: an engine that measures WPM,
accuracy, consistency and per-key error rates (`useTypingEngine.js`); a stage that
renders a passage with a measured caret (`TypingStage.jsx`); XP, levels, streaks,
achievements and daily missions (`gamification.js`); and a cloud-synced profile with an
avatar and a public leaderboard (`0005`, `0007`). What it has never had is *another
person*. Every number the app produces is compared only against your own past.

Battlefield reuses roughly 80% of the existing typing surface (§15) and adds the one
thing missing: someone to beat.

### Non-goals for v1

- No spectator mode, no rematch-with-same-roster button, no room chat, no team modes.
- No matchmaking, no public room browser — PIN-only, deliberately, so a room is a thing
  you share with people you know.
- No ELO / ranked ladder. The global XP leaderboard (`public.leaderboard`) stays the
  only cross-user ranking.
- No server-authoritative keystroke replay. See §14 for what is and is not defensible
  without a backend.

---

## 2. User flow

### 2.1 Host

```
/battle
  │
  ├─ [Create Battlefield] ──► battle_create() RPC
  │                            • mints a unique 6-char PIN
  │                            • creator becomes admin
  │                            • room status = 'lobby'
  │                            • passage chosen + stored (host-side, §8)
  │                            └─► navigate /battle/:pin
  │
  ▼
LOBBY  (status = 'lobby')
  • PIN displayed large, one-tap copy, share link /battle/:pin
  • roster fills in live as people join
  • host controls: kick, max players, difficulty, passage length, regenerate passage
  • [Start match] enabled at ≥ 2 players
  │
  ├─ [Start match] ──► battle_start() RPC
  │                     • roster frozen, joins refused from this instant
  │                     • status = 'countdown', starts_at = now() + 3.5s
  │
  ▼
COUNTDOWN  (status = 'countdown')  — 3 · 2 · 1 · GO, driven by starts_at, not a local timer
  │
  ▼
RACE  (status = 'active')
  • passage revealed, engine armed, keystrokes accepted
  • own stats in the header (LiveStats compact), rivals in the race track
  • host additionally sees the admin dashboard panel: every player's live row
  │
  ▼
RESULTS  (status = 'finished')
  • 🥇🥈🥉 podium + full ranking + match statistics
  • [Play again] → creates a *new* room, pre-seeded with the same settings
```

### 2.2 Joiner

```
/battle ──► enters PIN ──► battle_join(pin) RPC
                            ├─ invalid    → "No Battlefield with that code."
                            ├─ full       → "That Battlefield is full (8/8)."
                            ├─ started    → "That match has already started."
                            ├─ closed     → "That Battlefield has ended."
                            ├─ already in → silently rejoins (idempotent, §12)
                            └─ ok         → /battle/:pin, lands in LOBBY
```

From the lobby onward the joiner's flow is identical to the host's, minus the host
controls. A joiner may leave at any time before the countdown; after it, leaving is
recorded as a forfeit (§13.4).

### 2.3 Signed-out visitor

Battlefield requires an `auth.users` row, because every table is keyed on `auth.uid()`.
It does **not** require an email. `signInAnonymously(displayName)` already exists in
`supabase.js` and mints a real user row from nothing but a name — the same mechanism
onboarding uses. So the signed-out flow is: type a name → guest account created → join.
No sign-up wall.

If `SUPABASE_ENABLED` is false (a keyless build), `/battle` renders an explanatory empty
state and nothing else. This matches how `AccountMenu` already behaves and keeps G3 from
PRD 04 honest — the local-only app is unchanged by this feature's existence.

---

## 3. Functional requirements

| # | Requirement | Enforced by |
|---|---|---|
| FR-1 | Any authenticated user (including a guest) may create a Battlefield | `battle_create()`, RLS insert policy |
| FR-2 | Each room gets a unique 6-character alphanumeric PIN | `battle_mint_pin()` + `unique` index, §7.2 |
| FR-3 | The creator is the room admin | `battle_rooms.admin_id = auth.uid()` at insert |
| FR-4 | Max 8 players, configurable per room (2–8) | `max_players` column + `check`, re-checked in `battle_join()` |
| FR-5 | Users join by PIN | `battle_join(pin)` |
| FR-6 | Invalid PIN is refused | `battle_join()` raises `BF001` |
| FR-7 | Duplicate join is refused (or idempotently re-attached) | unique `(room_id, user_id)`; `battle_join()` returns the existing row |
| FR-8 | A full room is refused | `battle_join()` raises `BF003`, counted inside the same transaction |
| FR-9 | A started room is refused | `battle_join()` raises `BF004` on `status <> 'lobby'` |
| FR-10 | The lobby roster updates in real time | Postgres Changes on `battle_players` |
| FR-11 | All players receive the identical passage | passage stored once on `battle_rooms`, §8 |
| FR-12 | 3-second synchronised countdown; simultaneous start | server-set `starts_at` + clock-offset handshake, §10 |
| FR-13 | No joining after the match starts | FR-9, plus roster freeze at `battle_start()` |
| FR-14 | Live WPM, accuracy, mistakes, progress, finish status | Broadcast at 2 Hz, §9.2 |
| FR-15 | Admin dashboard shows every participant's live stats | same channel, admin-only panel |
| FR-16 | Final ranking: mistakes ▸ WPM ▸ accuracy ▸ finish time | `battle_leaderboard()`, §6 |
| FR-17 | 🥇🥈🥉 and complete rankings with match statistics | `FinalLeaderboard` component |
| FR-18 | Results feed the existing XP / streak / achievement loop | `recordSession({ kind: 'battle' })`, §16.3 |
| FR-19 | A refresh at any phase restores the correct phase | room status is durable; §13.3 |
| FR-20 | A room cannot live forever | `expires_at` + `battle_reap()` cron, §5.4 |

---

## 4. Ranking rules

Exactly as specified, in this order:

1. **Fewest mistakes** (ascending)
2. **Highest WPM** (descending)
3. **Highest accuracy** (descending)
4. **Earliest finish time** (ascending) — tie-breaker

```sql
order by mistakes asc, wpm desc, accuracy desc, finished_at asc
```

### 4.1 One consequence worth stating before you ship it

Mistakes-first is a strong rule. A player who types 40 WPM with zero mistakes beats a
player who types 130 WPM with one — the WPM comparison never runs, because the mistake
comparison already resolved it. On a 300-character passage a single mistyped character is
a ~0.3% accuracy hit and a total ordering loss.

That may be exactly what you want: it makes Battlefield a *precision* contest, which is
consistent with the rest of the product (`xpForSession` already treats accuracy as the
multiplier and explicitly refuses to reward key-mashing). It is also going to surprise
people who expect a typing race to be about speed, and it makes ties in the top slot
almost impossible, so criteria 2–4 will rarely be exercised.

**Recommendation:** ship it as specified, and surface *why* someone won directly in the
results UI — "Won on 0 mistakes" / "Won on WPM (tied at 2 mistakes)" — computed from
which comparison actually broke the tie. That turns the surprising rule into a legible
one. If you later want speed-first, it is a one-line change in `battle_leaderboard()`
plus the mirrored comparator in `ranking.js`; the schema does not change.

### 4.2 Players who do not finish

The spec does not cover this, and it must be defined or the ranking is undefined for the
common case. Rule:

- **Every finisher outranks every non-finisher**, regardless of mistakes. Someone who
  completed the passage beat someone who did not, full stop.
- Among non-finishers, rank by `progress_chars desc`, then apply criteria 1–4 to what
  they did type.
- Non-finishers are shown below a divider labelled *Did not finish*, with their progress
  percentage. They still earn XP for the work done (§16.3), because the rest of the app
  already awards partial runs.

Implemented as a leading sort key `(finished_at is null)` so it costs nothing:

```sql
order by (finished_at is null),          -- finishers first
         case when finished_at is null then -progress_chars else 0 end,
         mistakes asc, wpm desc, accuracy desc, finished_at asc
```

---

## 5. Room lifecycle & state management

### 5.1 States

| State | Meaning | Joins? | Passage visible? | Keystrokes accepted? |
|---|---|---|---|---|
| `lobby` | Roster filling | ✅ | ❌ (§14.4) | ❌ |
| `countdown` | 3-2-1, roster frozen | ❌ | ✅ | ❌ |
| `active` | Race in progress | ❌ | ✅ | ✅ |
| `finished` | All finished, or deadline hit | ❌ | ✅ | ❌ |
| `aborted` | Admin cancelled, or too few players at start | ❌ | ❌ | ❌ |
| `expired` | Reaped by cron (§5.4) | ❌ | ❌ | ❌ |

### 5.2 Transitions

```
                    battle_start()          starts_at reached
  ┌────────┐  (admin, ≥2 players)  ┌───────────┐   (client, idempotent)  ┌────────┐
  │ lobby  │ ─────────────────────►│ countdown │ ───────────────────────►│ active │
  └────────┘                        └───────────┘                        └────────┘
      │                                   │                                   │
      │ battle_abort()                    │ battle_abort()                    │ last finish
      │ or admin leaves w/ 0 heirs        │                                   │ or deadline
      ▼                                   ▼                                   ▼
  ┌─────────┐                        ┌─────────┐                        ┌──────────┐
  │ aborted │                        │ aborted │                        │ finished │
  └─────────┘                        └─────────┘                        └──────────┘
      │                                                                       │
      └──────────────── battle_reap() after expires_at ──────────────────────►│ expired │
```

Every transition is a `SECURITY DEFINER` function with a guard on the current status, so
a stale client cannot drive the room backwards. `battle_start()` on a room already in
`countdown` is a no-op that returns the existing row rather than an error — that makes a
double-click on **Start match** harmless.

### 5.3 Who owns the `countdown → active` transition

Nobody flips it explicitly. `starts_at` is the authority: a client treats the room as
active once `serverNow() >= starts_at`, and the first `battle_finish()` or
`battle_touch()` call after that instant lazily writes `status = 'active'` for the
benefit of anyone loading the room cold. This avoids needing a timer process — there
isn't one to have.

### 5.4 Expiry

| Condition | Action |
|---|---|
| `lobby` with no roster change for 30 min | → `expired` |
| `countdown` for > 60 s (host closed the tab mid-transition) | → `aborted` |
| `active` past `deadline_at` (= `starts_at` + `time_limit_sec` + 15 s grace) | → `finished`, unfinished players ranked per §4.2 |
| `finished` / `aborted` older than 7 days | rows deleted |

Run by `battle_reap()` on a `pg_cron` schedule (`*/5 * * * *`). `pg_cron` is available on
Supabase but is **not currently enabled on this project** — see §17, gap G6. Until it is,
the same function is called opportunistically from `battle_join()` and `battle_create()`,
which is enough at this scale (14 profiles today) and costs one cheap indexed `update`
per room creation.

---

## 6. Database schema

New migration: **`supabase/migrations/0009_battlefield.sql`**. It follows every
convention `0001`–`0008` established: `create table if not exists`, `drop policy if
exists` before each `create policy`, `SECURITY DEFINER` helpers with `set search_path =
''`, and a comment block above each object explaining *why* rather than *what*.

### 6.1 `battle_rooms`

```sql
create table if not exists public.battle_rooms (
  id            uuid primary key default gen_random_uuid(),
  pin           text not null,
  admin_id      uuid not null references auth.users on delete cascade,
  status        text not null default 'lobby'
                  check (status in ('lobby','countdown','active','finished','aborted','expired')),
  max_players   int  not null default 8 check (max_players between 2 and 8),

  -- The passage, chosen once by the host and never regenerated after start.
  -- This column is the entire reason FR-11 holds: if each client called
  -- generatePassage() the eight players would race eight different texts.
  passage       text not null,
  passage_meta  text,                       -- "AI · 62 words · normal", shown under the stage
  passage_chars int  not null,              -- denormalised: the ranking and the
                                            -- plausibility floor (§14.2) both need it
                                            -- without reading the passage itself
  difficulty    text not null default 'normal',
  time_limit_sec int not null default 180 check (time_limit_sec between 30 and 900),

  -- Server-set at battle_start(). Every client's countdown and every duration
  -- measurement is anchored here, never to a local clock. See §10.
  starts_at     timestamptz,
  deadline_at   timestamptz,

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  expires_at    timestamptz not null default now() + interval '30 minutes'
);

-- The PIN is the join credential, so uniqueness has to be a constraint and not a
-- best-effort check in application code. Partial: a finished room's PIN is free
-- to be reissued, which keeps the 32^6 space from silting up over time.
create unique index if not exists battle_rooms_pin_live_uniq
  on public.battle_rooms (pin)
  where status in ('lobby','countdown','active');

create index if not exists battle_rooms_admin_idx  on public.battle_rooms (admin_id);
create index if not exists battle_rooms_reap_idx   on public.battle_rooms (expires_at)
  where status in ('lobby','countdown','active');
```

### 6.2 `battle_players`

The roster. One row per participant per room, holding both the identity snapshot (so the
lobby renders without eight profile joins) and the live-ish progress checkpoint.

```sql
create table if not exists public.battle_players (
  room_id       uuid not null references public.battle_rooms on delete cascade,
  user_id       uuid not null references auth.users on delete cascade,

  -- Snapshotted at join, not joined at read time. `profiles` is owner-readable
  -- only (0001) and admin-readable (0002); a room-mate is neither, and loosening
  -- that policy to render a roster would expose goal settings and streak history
  -- to strangers. Copying two display fields is the narrow alternative — the
  -- same trade-off `public.leaderboard` (0005) already makes.
  display_name  text,
  avatar        text,

  is_admin      boolean not null default false,
  joined_at     timestamptz not null default now(),
  left_at       timestamptz,

  -- Durable checkpoint. Broadcast (§9.2) carries the 2 Hz stream; this is written
  -- at most every 3 s so a reconnecting client and the results screen have a
  -- floor to fall back to when the ephemeral stream is gone.
  progress_chars int  not null default 0,
  wpm            real not null default 0,
  accuracy       real not null default 100,
  mistakes       int  not null default 0,

  status        text not null default 'waiting'
                  check (status in ('waiting','ready','racing','finished','forfeit','disconnected')),
  finished_at   timestamptz,
  duration_sec  real,

  -- Anti-cheat bookkeeping, §14. Never blocks a write; it annotates one.
  flags         text[] not null default '{}',

  primary key (room_id, user_id)
);

create index if not exists battle_players_user_idx on public.battle_players (user_id);
```

`primary key (room_id, user_id)` is what makes FR-7 structural rather than a race
condition: two taps on **Join** cannot produce two roster rows.

### 6.3 `battle_results`

Immutable, append-only, one row per player per match. Separate from `battle_players`
because the roster row is mutable throughout the race and a result must not be.

```sql
create table if not exists public.battle_results (
  room_id       uuid not null references public.battle_rooms on delete cascade,
  user_id       uuid not null references auth.users on delete cascade,

  display_name  text,
  avatar        text,

  -- Client-reported, then corrected server-side. `wpm` below is what the ranking
  -- uses and it is recomputed in battle_finish() from correct_chars and the
  -- server-measured elapsed time; the client's own number is kept in
  -- client_wpm purely so a divergence is visible in the data. See §14.2.
  correct_chars int  not null,
  typed_chars   int  not null,
  mistakes      int  not null,
  accuracy      real not null,
  consistency   real,
  wpm           real not null,
  raw_wpm       real,
  client_wpm    real,

  finished      boolean not null default true,
  finished_at   timestamptz not null default now(),
  duration_sec  real not null,

  rank          int,                        -- written by battle_settle(), §7.9
  flags         text[] not null default '{}',
  created_at    timestamptz not null default now(),

  primary key (room_id, user_id)
);

create index if not exists battle_results_user_idx on public.battle_results (user_id, created_at desc);
```

### 6.4 Membership helper — and why it must be `SECURITY DEFINER`

Battlefield needs a policy shape this schema has never had: **cross-user reads scoped to
a shared room**. Every existing policy is either `auth.uid() = user_id` or
`public.is_admin()`.

The naive version recurses. A policy on `battle_players` that reads `battle_players` to
decide whether you are in the room re-enters the same policy, and Postgres either errors
or stack-overflows. `0002` already solved this exact problem for `user_roles` with
`is_admin()`; the same trick applies:

```sql
-- SECURITY DEFINER so the policies below can call it without re-entering the RLS
-- they are themselves evaluating. Identical reasoning to is_admin() in 0002.
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
```

### 6.5 RLS policies

```sql
alter table public.battle_rooms   enable row level security;
alter table public.battle_players enable row level security;
alter table public.battle_results enable row level security;

-- ── rooms ──────────────────────────────────────────────────────────────────
-- Read: members only. Deliberately NOT "anyone who knows the PIN" — a client
-- that could select by PIN could enumerate the 32^6 space and harvest live
-- rooms. Joining goes through battle_join(), which is SECURITY DEFINER and can
-- see rooms the caller cannot. See §14.5.
drop policy if exists "members read" on public.battle_rooms;
create policy "members read" on public.battle_rooms
  for select using (public.in_battle(id) or admin_id = auth.uid());

-- No direct insert/update/delete policy at all. Every mutation is an RPC.
-- This is the same stance 0002 takes on user_roles: if there is no policy,
-- there is no client-side path, and the SECURITY DEFINER functions become the
-- only writers by construction.

drop policy if exists "admins read all" on public.battle_rooms;
create policy "admins read all" on public.battle_rooms for select using (public.is_admin());

-- ── players ────────────────────────────────────────────────────────────────
drop policy if exists "members read" on public.battle_players;
create policy "members read" on public.battle_players
  for select using (public.in_battle(room_id));

-- The one direct write the client is allowed: your own progress checkpoint, and
-- only while the room is actually running. Everything else — joining, leaving,
-- finishing, being kicked — is an RPC, because each carries a validation the
-- client cannot be trusted to perform on itself.
drop policy if exists "own progress" on public.battle_players;
create policy "own progress" on public.battle_players
  for update using (
    user_id = auth.uid()
    and exists (select 1 from public.battle_rooms r
                 where r.id = room_id and r.status in ('countdown','active'))
  );

drop policy if exists "admins read all" on public.battle_players;
create policy "admins read all" on public.battle_players for select using (public.is_admin());

-- ── results ────────────────────────────────────────────────────────────────
drop policy if exists "members read" on public.battle_results;
create policy "members read" on public.battle_results
  for select using (public.in_battle(room_id));

-- No insert policy. battle_finish() is the only writer. No update policy, ever —
-- that is what "immutable" means here, and it is the single most important line
-- in this file for §14.
drop policy if exists "admins read all" on public.battle_results;
create policy "admins read all" on public.battle_results for select using (public.is_admin());
```

A `grant execute` on each RPC to `authenticated` completes the picture. `anon` gets
nothing — Battlefield always requires a user row, guest or otherwise.

### 6.6 Realtime publication

```sql
alter publication supabase_realtime add table public.battle_rooms;
alter publication supabase_realtime add table public.battle_players;
alter publication supabase_realtime add table public.battle_results;

-- Postgres Changes respects RLS only when replica identity carries enough of the
-- row to evaluate the policy against. Default (primary key only) is not enough
-- for battle_players, whose policy reads room_id — which is in the PK — but is
-- not enough for battle_rooms, whose policy reads admin_id.
alter table public.battle_rooms   replica identity full;
alter table public.battle_players replica identity full;
alter table public.battle_results replica identity full;
```

`replica identity full` ships the whole row in the WAL. At eight rows per room that is
free; do not copy this onto `sessions`.

---

## 7. APIs

There is no HTTP API to design (§0.1). "The API" is a set of Postgres functions exposed
through PostgREST at `/rest/v1/rpc/<name>`, called from the client with
`supabase.rpc(...)`. The client-side wrapper module mirrors `src/modules/admin/adminApi.js`
in shape and in its "RLS is the real gate" stance.

All functions are `security definer`, `set search_path = ''`, and raise typed errors with
a `BF###` code so the UI can map them to copy without string-matching.

### 7.1 `battle_server_time() → timestamptz`

```sql
create or replace function public.battle_server_time() returns timestamptz
language sql stable as $$ select now(); $$;
```

Trivial and load-bearing. The clock-offset handshake in §10 is the only thing standing
between "synchronised countdown" and "everyone starts whenever their laptop thinks it is
time".

### 7.2 `battle_mint_pin() → text`

Six characters from a 32-symbol alphabet with `0 O 1 I L U` removed — `0/O` and `1/I/L`
are the pairs people misread off a screen, and `U` is dropped so the generator cannot
produce an unfortunate word. 32⁶ ≈ 1.07 billion live combinations against a partial
unique index that only covers *live* rooms, so collisions are a non-event at any plausible
scale.

```sql
create or replace function public.battle_mint_pin() returns text
language plpgsql security definer set search_path = '' as $$
declare
  alphabet constant text := '23456789ABCDEFGHJKMNPQRSTVWXYZ';
  candidate text;
begin
  for _ in 1..12 loop
    candidate := '';
    for _ in 1..6 loop
      candidate := candidate || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    if not exists (
      select 1 from public.battle_rooms
       where pin = candidate and status in ('lobby','countdown','active')
    ) then
      return candidate;
    end if;
  end loop;
  raise exception 'Could not mint a unique PIN' using errcode = 'BF009';
end; $$;
```

The retry loop plus the unique index is belt and braces: the loop avoids the common case,
the index makes the rare concurrent case a caught error rather than a duplicate room.

### 7.3 `battle_create(passage, passage_meta, difficulty, max_players, time_limit_sec) → battle_rooms`

Inserts the room with `admin_id = auth.uid()`, mints the PIN, and inserts the creator's
own `battle_players` row with `is_admin = true` in the same transaction — a room with an
admin who is not on the roster is not a state worth being able to reach.

Validates `max_players between 2 and 8`, `length(passage) between 80 and 4000`, and
refuses if the caller already administers 3 or more live rooms (`BF010`) — a cheap ceiling
on room-spam from one account.

### 7.4 `battle_join(pin) → battle_rooms`

The single most important function in the feature. Every join rule from §3 is enforced
here, inside one transaction, so none of them can be raced:

```sql
create or replace function public.battle_join(p_pin text)
returns public.battle_rooms
language plpgsql security definer set search_path = '' as $$
declare
  r public.battle_rooms;
  n int;
begin
  if auth.uid() is null then
    raise exception 'Sign in to join' using errcode = 'BF000';
  end if;

  -- FOR UPDATE is what makes the capacity check correct. Without the row lock,
  -- two people joining a 7/8 room simultaneously both read 7, both pass, and the
  -- room ends up with 9 players. The lock serialises them.
  select * into r from public.battle_rooms
   where pin = upper(trim(p_pin))
     and status in ('lobby','countdown','active')
   for update;

  if not found                         then raise exception 'No Battlefield with that code' using errcode = 'BF001'; end if;
  if r.expires_at < now()              then raise exception 'That Battlefield has expired'  using errcode = 'BF002'; end if;

  -- Idempotent rejoin: already a member is a success, not an error. This is the
  -- refresh path and the double-tap path, and both should land you in the room.
  if exists (select 1 from public.battle_players
              where room_id = r.id and user_id = auth.uid() and left_at is null) then
    return r;
  end if;

  if r.status <> 'lobby'               then raise exception 'That match has already started' using errcode = 'BF004'; end if;

  select count(*) into n from public.battle_players
   where room_id = r.id and left_at is null;
  if n >= r.max_players                then raise exception 'That Battlefield is full' using errcode = 'BF003'; end if;

  insert into public.battle_players (room_id, user_id, display_name, avatar)
  select r.id, auth.uid(), p.display_name, p.avatar
    from public.profiles p where p.id = auth.uid()
  on conflict (room_id, user_id) do update
    set left_at = null, joined_at = now();

  update public.battle_rooms
     set updated_at = now(), expires_at = now() + interval '30 minutes'
   where id = r.id returning * into r;

  return r;
end; $$;
```

Note `for update` and the `on conflict` clause. Between them, FR-7 and FR-8 are correct
under concurrency, which they would not be if either check lived in JavaScript.

### 7.5 `battle_leave(room_id)`

Sets `left_at`. If the room is `active`, additionally sets `status = 'forfeit'` and
writes a `battle_results` row with `finished = false`. If the leaver is the admin, runs
the succession rule (§13.5).

### 7.6 `battle_kick(room_id, user_id)`

Admin-only (`is_battle_admin`), lobby-only. Sets `left_at` and pushes a `kicked` broadcast
so the kicked client navigates out rather than sitting in a room it can no longer read.

### 7.7 `battle_start(room_id) → battle_rooms`

Admin-only. Requires `status = 'lobby'` and ≥ 2 live players (`BF005`, `BF006`). Sets:

```sql
status      = 'countdown',
starts_at   = now() + interval '3.5 seconds',
deadline_at = now() + interval '3.5 seconds' + make_interval(secs => r.time_limit_sec + 15)
```

**3.5 s, not 3 s.** The visible countdown is three beats; the extra 500 ms is propagation
budget — the Postgres Changes event has to travel to eight clients before the earliest of
them can start, and a client that receives `starts_at` *after* it has already passed would
otherwise start mid-race. Measured Supabase Realtime propagation is typically 50–150 ms;
500 ms is a comfortable multiple of that. See §10.3 for what happens when it is not
enough.

Idempotent: called on a room already in `countdown`, returns the existing row unchanged so
the 3.5 s window does not restart.

### 7.8 `battle_finish(room_id, correct_chars, typed_chars, mistakes, accuracy, consistency, client_wpm) → battle_results`

Insert-only, one row per `(room, user)`, `on conflict do nothing` so a retried call after
a flaky response cannot rewrite a result. Recomputes the authoritative WPM from
server-measured elapsed time (§14.2), applies the plausibility floor, sets flags, and —
when it is the last outstanding player — calls `battle_settle()`.

### 7.9 `battle_settle(room_id)`

Sets `status = 'finished'`, materialises `battle_results.rank` using the §4 ordering, and
writes a `settled` broadcast. Idempotent on `status = 'finished'`.

Ranking is materialised rather than computed at read time so that every client, and every
later read of the match, sees the same numbers — the same reasoning `public.leaderboard`
gives for computing `rank()` in the view instead of in the client.

### 7.10 `battle_leaderboard(room_id) → setof ranked rows`

Read path for the results screen and for any client that loads a finished room cold.
Returns the §4 ordering, joined to display name and avatar, with a `won_on` column naming
which criterion broke the tie (§4.1).

### 7.11 `battle_passage(room_id) → text`

Returns the passage **only** when `status in ('countdown','active','finished')` and the
caller is a member. This is what stops a lobby-sitter from pre-reading the text (§14.4).
The `passage` column itself is excluded from the client's `select` list on
`battle_rooms`; PostgREST honours explicit column lists, and the RPC is the only sanctioned
route.

### 7.12 `battle_abort(room_id)` / `battle_reap()`

Admin cancel, and the janitor from §5.4.

### 7.13 Client wrapper — `src/lib/battle/api.js`

```js
export async function createBattle({ passage, passageMeta, difficulty, maxPlayers, timeLimitSec })
export async function joinBattle(pin)
export async function leaveBattle(roomId)
export async function kickPlayer(roomId, userId)
export async function startBattle(roomId)
export async function finishBattle(roomId, run)
export async function fetchRoom(pin)
export async function fetchRoster(roomId)
export async function fetchPassage(roomId)
export async function fetchBattleLeaderboard(roomId)
export async function serverTime()
```

Each returns data or throws with `err.code` carrying the `BF###`, mapped to copy by
`BATTLE_ERROR_COPY` — the same pattern `AI_REASON_COPY` uses in `ai-runner.js`.

---

## 8. The passage

FR-11 is where a naive implementation breaks first. `Practice.jsx` calls
`generatePassage()` on every mount, which means eight clients would produce eight
different texts. The passage therefore has to be **chosen once, by the host, before the
room exists**, and stored on the row.

### 8.1 Host-side selection — `src/lib/battle/passage.js`

Reuses the existing content pipeline unchanged:

```js
import { generatePassage } from '../ai.js';
import { randomWords, randomQuote } from '../content.js';

/**
 * Picks the one text every player in a room will race.
 *
 * Mirrors Practice.jsx's own strategy — bundled banks answer immediately, the
 * model's text replaces it when it lands — but resolves to a single value
 * *before* the room is created rather than swapping under a live stage. A room
 * whose passage changed after people joined would be a different contest for
 * whoever was mid-read.
 */
export async function pickBattlePassage({ difficulty, words, signal }) {
  const fallback = { text: randomWords(words, difficulty), meta: `${words} words · ${difficulty}` };
  if (!aiConfigured()) return fallback;
  try {
    const res = await generatePassage({ mode: 'words', difficulty, words, signal });
    return { text: res.text, meta: `${res.label} · AI` };
  } catch {
    return fallback;                     // a slow model must not block room creation
  }
}
```

The AI call is given a hard 6-second budget in the create flow. Past that, the bundled
bank wins and the room opens — waiting 30 seconds on `glm-5.2` (see the latency table in
`config.js`) while four people stare at a spinner is worse than a bundled passage.

### 8.2 Length

`time_limit_sec` and passage length are chosen together so a median typist finishes with
room to spare:

| Preset | Words | Chars ≈ | Limit | Finishes at |
|---|---|---|---|---|
| Sprint | 30 | 170 | 60 s | 35 WPM |
| Standard *(default)* | 60 | 340 | 120 s | 34 WPM |
| Marathon | 140 | 800 | 300 s | 32 WPM |

The host picks the preset in the lobby; changing it regenerates the passage and is
disabled once anyone has joined, so nobody's expectations change under them.

---

## 9. Real-time architecture

Two channels of information with genuinely different requirements, so two mechanisms.

### 9.1 Durable state → Postgres Changes

Room status, roster membership, and final results are **facts that must survive a
refresh**. They go through Postgres Changes on the three published tables (§6.6), which
means they are RLS-filtered by the server and consistent with what a cold page load
would fetch.

```js
supabase
  .channel(`battle:${roomId}`)
  .on('postgres_changes',
      { event: '*', schema: 'public', table: 'battle_rooms',   filter: `id=eq.${roomId}` },   onRoom)
  .on('postgres_changes',
      { event: '*', schema: 'public', table: 'battle_players', filter: `room_id=eq.${roomId}` }, onRoster)
  .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'battle_results', filter: `room_id=eq.${roomId}` }, onResult)
```

Volume is tiny: a handful of events per room per match.

### 9.2 Live telemetry → Broadcast

Progress ticks are the opposite: high frequency, worthless one second later, and
catastrophic to write to Postgres. Eight players × 2 Hz × 120 s = **1,920 row updates per
match** if this went through the database, on a table eight subscribers are watching. That
is not a scaling concern, it is a design error.

Broadcast never touches Postgres:

```js
const channel = supabase.channel(`battle:${roomId}`, {
  config: { broadcast: { self: false, ack: false } },
});

// 2 Hz, ref-driven, never through React state
channel.send({
  type: 'broadcast',
  event: 'tick',
  payload: { u: shortId, p: progressChars, w: wpm | 0, a: accuracy | 0, m: mistakes },
});
```

Payload is deliberately single-letter-keyed and integer-rounded: ~60 bytes versus ~180
for the readable version, which matters at the message counts in §16.1.

Events on the channel:

| Event | Sender | Payload | Purpose |
|---|---|---|---|
| `tick` | every racer, 2 Hz | `{u,p,w,a,m}` | the race track and the admin dashboard |
| `done` | a racer, once | `{u,p,w,a,m,t}` | instant finish feedback ahead of the DB write |
| `kicked` | admin | `{u}` | tells the kicked client to leave |
| `settled` | finisher/admin | `{}` | nudges everyone to fetch the final board |

Broadcast is **advisory**. Every event it carries also arrives, more slowly, through the
durable path — a `done` is followed by a `battle_results` insert, a `settled` by a
`battle_rooms` status change. A dropped broadcast costs a moment of staleness, never a
wrong outcome. That property is what lets the whole hot path stay off the database.

### 9.3 Connection state → Presence

```js
channel.on('presence', { event: 'sync' }, () => setOnline(new Set(Object.keys(channel.presenceState()))));
channel.track({ u: userId });
```

Presence answers "is this player's tab still open", which neither of the other two
mechanisms can. It drives the connection dot on each player tile and the disconnect
handling in §13.6.

### 9.4 Channel authorization

The channel topic is `battle:<uuid>`, **not** `battle:<pin>`. A PIN is a six-character
secret people read aloud; a room id is a uuid nobody can guess. Using the PIN as the topic
name would let anyone who overheard it subscribe to the telemetry of a room they were
refused entry to.

If Broadcast Authorization is enabled on the project, add the matching policy on
`realtime.messages` restricting `topic like 'battle:%'` to `public.in_battle(...)` of the
uuid suffix, and open the channel with `{ config: { private: true } }`. If it is not
enabled, the uuid topic is the mitigation. Enabling it is listed as gap **G5** in §17.

---

## 10. Countdown synchronisation

The requirement is that eight people, on eight machines with eight differently-wrong
clocks, start typing at the same instant. `Date.now()` is not usable — browser clocks
routinely drift by seconds, and a player whose clock is 4 s fast would start 4 s early.

### 10.1 Clock offset handshake — `src/lib/battle/clock.js`

Classic three-timestamp estimate, run on entering the room and again on reconnect:

```js
/**
 * How far this browser's clock is from Postgres's, in ms.
 *
 * Round trips are asymmetric and jittery, so a single sample is noise. Five
 * samples, keep the three with the lowest RTT, take the median — the same
 * shape NTP uses and for the same reason.
 */
export async function measureClockOffset(samples = 5) {
  const readings = [];
  for (let i = 0; i < samples; i++) {
    const t0 = performance.timeOrigin + performance.now();
    const server = Date.parse(await serverTime());
    const t1 = performance.timeOrigin + performance.now();
    readings.push({ rtt: t1 - t0, offset: server + (t1 - t0) / 2 - t1 });
  }
  readings.sort((a, b) => a.rtt - b.rtt);
  const best = readings.slice(0, 3).map((r) => r.offset).sort((a, b) => a - b);
  return best[1];
}

export const serverNow = (offset) => Date.now() + offset;
```

`performance.timeOrigin + performance.now()` rather than `Date.now()` for the local
endpoints: it is monotonic, so an NTP correction landing mid-handshake cannot corrupt a
sample.

### 10.2 Driving the countdown

```js
const msUntilStart = Date.parse(room.starts_at) - serverNow(offset);
```

The overlay renders `ceil(msUntilStart / 1000)` on a `requestAnimationFrame` loop, shows
**GO** at zero, and calls `engine.begin()` — the engine's clock starts from the *server*
start instant, not from the local frame that noticed it (§15.1). Two players who render
GO 80 ms apart still have identical elapsed times, because elapsed is measured against
`starts_at`.

### 10.3 Late arrival

If `msUntilStart` is already negative when the countdown event arrives — a slow tab, a
suspended laptop, a broadcast that took 900 ms — the client skips the countdown, starts
immediately, and shows a small *joined late by 0.4 s* note. The player is genuinely
disadvantaged by that amount and pretending otherwise is worse than saying so. Beyond
5 seconds late the client offers to spectate instead of race, since the race is
unwinnable.

---

## 11. Backend services

There is no server tier, so "backend services" means (a) Postgres functions, listed in
§7, and (b) the client modules that own state and side effects on their behalf. The
latter follow this repo's existing separation: a transport module, a task module, and a
React hook, the same split `ai-runner.js` / `ai.js` / `useStreamingChat.js` already uses.

```
src/lib/battle/
  api.js         RPC wrappers + BATTLE_ERROR_COPY.        Mirrors modules/admin/adminApi.js.
  channel.js     Realtime subscribe / publish / presence.  Owns throttling and teardown.
  clock.js       Server-clock offset (§10.1).
  ranking.js     The §4 comparator, in JS.                 ⚠ see below.
  passage.js     Host-side passage selection (§8.1).
  useBattleRoom.js   The room state machine hook: status, roster, live stats, phase.
  useBattleChannel.js Subscription lifecycle, reconnect, backoff.
```

**⚠ `ranking.js` is a deliberate duplicate of `battle_leaderboard()`'s ORDER BY**, needed
for the optimistic race-track ordering during the race, when no result rows exist yet.
Two implementations of one rule is exactly the drift risk `gamification.js` calls out for
`bumpDaily` ("two implementations of what a day's totals mean would drift"). Mitigate the
same way it does: a header comment on both sides naming the other as the twin, and a unit
test that feeds a fixture through both and asserts identical order. The SQL is
authoritative; the JS is a preview.

---

## 12. Validation rules

| Rule | Where | Failure |
|---|---|---|
| Caller is authenticated | every RPC | `BF000` — opens the auth modal |
| PIN is exactly 6 chars from the alphabet | client (input mask) + `battle_join` | inline, no request sent |
| PIN is normalised `upper(trim(...))` before lookup | `battle_join` | — |
| PIN resolves to a live room | `battle_join` | `BF001` "No Battlefield with that code." |
| Room has not expired | `battle_join` | `BF002` |
| Room is not full — checked under `for update` | `battle_join` | `BF003` "That Battlefield is full (8/8)." |
| Room has not started | `battle_join` | `BF004` "That match has already started." |
| Already a member → idempotent success | `battle_join` | returns the room |
| Only the admin may start / kick / abort | `is_battle_admin()` | `BF005` |
| ≥ 2 live players to start | `battle_start` | `BF006` "You need at least one opponent." |
| `max_players` in 2..8 | column `check` + `battle_create` | `BF007` |
| Passage 80..4000 chars | `battle_create` | `BF008` |
| ≤ 3 live rooms per admin | `battle_create` | `BF010` |
| Passage unreadable before countdown | `battle_passage` status guard | empty |
| One result row per player per room, never updated | PK + `on conflict do nothing`, no update policy | silently ignored |
| `duration_sec` ≥ plausibility floor | `battle_finish` | flagged, not rejected (§14.2) |
| `correct_chars` ≤ `passage_chars` | `battle_finish` | clamped + flagged |
| `accuracy` in 0..100, `mistakes` ≥ 0 | `battle_finish` | clamped |
| Display name defaults when blank | `battle_join` | `'Player'` |

---

## 13. Edge cases

### 13.1 Player refreshes during the lobby
Roster row persists (`left_at` is null), Postgres Changes re-delivers the roster on
resubscribe, and the client lands back in the lobby. Nothing to do.

### 13.2 Player refreshes mid-race
The unrecoverable one, and it needs to be honest rather than clever. Typed progress lives
only in `useTypingEngine`'s refs, which a reload destroys. Persisting keystrokes to
`sessionStorage` to allow a seamless resume would also hand a cheater a save-scum button.

**Rule:** on reload into an `active` room, the player rejoins at their last durable
checkpoint (`progress_chars`, written every 3 s) and continues typing from there, with a
`reloaded` flag on their result. They keep the elapsed time that passed while they were
gone — the race clock is anchored to `starts_at` and does not stop for anyone. The UI says
so plainly: *Reconnected — you lost 4.2 s.*

### 13.3 Player closes the tab and comes back after the match ended
Room status is `finished`, so `/battle/:pin` renders the results screen directly from
`battle_leaderboard()`. No special path — this is just §5.1 doing its job.

### 13.4 Player leaves mid-race
`battle_leave()` writes a `forfeit` result with `finished = false` and their last
checkpoint. They rank per §4.2. The remaining players are not blocked: the
"all players finished" test counts only `left_at is null` rows.

### 13.5 The admin leaves
Succession, not collapse. On `battle_leave()` by the admin:

- **Lobby, ≥ 1 player remains** → the earliest-joined remaining player becomes admin
  (`is_admin = true`, `battle_rooms.admin_id` updated). Everyone sees a toast naming the
  new host.
- **Lobby, nobody remains** → `status = 'aborted'`.
- **Countdown or active** → the match continues to completion. Admin powers do not matter
  once a race is running; the only thing lost is the ability to abort, and the deadline
  handles that.

### 13.6 A player disconnects without leaving
Presence drops them. After 10 s with no presence and no tick, their tile dims and shows
*Disconnected*, and their `battle_players.status` becomes `disconnected` on the next
checkpoint write by any client. They are not forfeited — a tunnel or a Wi-Fi hiccup should
not end a match, and their engine is still running locally. If they never return, the
deadline (§5.4) settles the room without them.

### 13.7 Everyone disconnects
No client is left to call `battle_settle()`. `battle_reap()` finds the room past
`deadline_at` and settles it. Until `pg_cron` is enabled (gap G6) this happens on the next
`battle_create()` or `battle_join()` by anyone, which at current scale is within minutes.

### 13.8 The host never presses Start
The lobby expires after 30 minutes of roster inactivity. `expires_at` is pushed forward on
every join, so an actively-filling lobby never expires under its occupants.

### 13.9 Two people join the last slot simultaneously
`for update` in `battle_join()` serialises them; the second gets `BF003`. This is the
reason capacity is checked in SQL and not in JavaScript.

### 13.10 A player finishes before the countdown ends
Impossible by construction — the engine ignores keystrokes until `begin()` (§15.1), and
`battle_finish()` rejects a `duration_sec` below the plausibility floor.

### 13.11 Slow AI passage generation blocks room creation
6-second budget, then the bundled bank (§8.1). The room always opens.

### 13.12 A player's clock is wildly wrong
Irrelevant. Every time comparison uses `serverNow(offset)`, and `duration_sec` is computed
server-side in `battle_finish()` from `now() - starts_at`.

### 13.13 The same account joins from two devices
The PK on `(room_id, user_id)` means one roster row. The second device rejoins
idempotently and both tabs race the same row, with the last checkpoint write winning. This
is a nuisance, not an exploit — it cannot produce two entries or two results. Show a
warning on the second device.

### 13.14 Supabase is unconfigured or offline
`/battle` renders the same explanatory empty state the rest of the app uses for
cloud-only surfaces. Mid-race, the typing engine is entirely local, so a network drop
degrades to "your rivals stopped moving" and the results write retries on reconnect —
`sync.js`'s existing `online` listener pattern applies unchanged.

### 13.15 A room's admin is deleted
`on delete cascade` on `admin_id` removes the room. Acceptable: account deletion is rare
and a live match belonging to a deleted account has no owner.

---

## 14. Security & anti-cheat

### 14.1 The honest framing

With no backend, a determined cheater can call `battle_finish()` directly from a console
with fabricated numbers. Nothing in this design prevents that, and no design that runs
entirely in the browser can. This repo has already reasoned about exactly this trade-off
and written it down — `0002_admin.sql` on `ai_usage`:

> *v1, client-reported … Numbers are advisory — a malicious client could misreport its own
> usage. Move behind an Edge Function proxy before this matters.*

Battlefield takes the same position, with the same stated migration path (§17, G4). The
measures below raise the cost of cheating and make it *visible*; they do not make it
impossible. Say so in the UI: a Battlefield is a race with friends, not a ranked ladder.

### 14.2 Server-recomputed WPM — the one strong measure

The client reports `correct_chars`; the *server* owns the clock. `battle_finish()`
therefore ignores the client's WPM for ranking and recomputes it:

```sql
elapsed := extract(epoch from (now() - r.starts_at));
wpm     := (least(p_correct_chars, r.passage_chars) / 5.0) / (elapsed / 60.0);
```

`starts_at` was set by `battle_start()` inside Postgres; `now()` is Postgres's. Neither is
reachable from the browser. To inflate WPM a cheater must inflate `correct_chars`, which
is bounded by `passage_chars` — so the ceiling on a forged score is "typed the whole
passage instantly", which the plausibility floor catches:

```sql
-- 20 chars/sec ≈ 240 WPM sustained. Above the world record for a sustained
-- passage; anything faster did not come from a keyboard.
if elapsed < p_correct_chars / 20.0 then
  flags := flags || 'impossible-speed';
end if;
```

Uses the same `CHARS_PER_WORD = 5` constant as `src/lib/typing.js`, so a Battlefield WPM
and a Practice WPM mean the same thing.

### 14.3 Immutable results
No update policy on `battle_results`, `on conflict do nothing` on insert. A result is
written once. This closes retry-until-favourable and post-settlement editing in one line.

### 14.4 Passage concealment before start
The passage is not selectable on `battle_rooms` by the client and is only returned by
`battle_passage()` once `status <> 'lobby'`. Without this, a player could sit in the lobby
reading the text for a minute before the host pressed Start, which is a decisive advantage
and completely invisible.

### 14.5 No PIN enumeration
`battle_rooms` has no policy permitting a select by PIN. Lookup happens only inside
`battle_join()`, which is `SECURITY DEFINER`. A scripted attacker can still call
`battle_join` in a loop, so `battle_create` caps live rooms per admin (`BF010`) and the
client applies a 1-per-second local throttle on join attempts. A rate limit that actually
binds needs either `pg_cron`-backed counters or Vercel BotID — listed as gap G7.

### 14.6 Flags, not bans
Every anomaly appends to `flags[]` and nothing is rejected outright. A rejected finish
means a real player with a fast machine and a slow network sees "your result was refused",
which is worse than a flagged result nobody looks at. Flags render as a small ⚠ on the
results row with a tooltip, are visible to the room admin, and are queryable by a site
admin through the existing `is_admin()` read policy.

### 14.7 Progress-tick abuse
Broadcast ticks are display-only — they feed the race track and nothing else. Fabricated
ticks let a cheater *look* fast mid-race without affecting the outcome, which is a prank,
not an exploit. The durable checkpoint has an `update` policy scoped to `user_id =
auth.uid()` and to a running room, so it cannot be written for someone else or after the
match.

### 14.8 Privacy
The roster snapshot (`display_name`, `avatar`) is exactly the two fields
`public.leaderboard` already exposes publicly. No email, no id beyond the uuid needed for
the PK, no settings, no streak data. `hide_from_leaderboard` intentionally does **not**
hide you inside a Battlefield: you chose to join a room with these people, and a race with
an anonymous participant is not a race. Say this next to the toggle in `Profile.jsx`.

### 14.9 Existing threat surface, unchanged
The `VITE_`-prefixed keys in the bundle and the unrotated credentials noted in `PLAN.md`
Phase 0 are pre-existing and out of scope here — but a multiplayer surface is a larger
target than a single-player one, so rotating the Supabase direct connection string before
this ships is worth doing. It is a dashboard click and nothing in this design depends on
it.

---

## 15. Existing components to reuse

The reuse ratio is the strongest argument for this feature's cost estimate.

| Reused as-is | Path | Role in Battlefield |
|---|---|---|
| `TypingStage` | `components/typing/TypingStage.jsx` | the passage + caret, unchanged |
| `LiveStats` | `components/typing/LiveStats.jsx` | **`compact` mode is already exactly the race header** — one row of WPM/ACC/ERR/TIME |
| `KeyboardViz`, `WeakKeyStrip` | `components/typing/` | optional, host-toggled |
| `SessionSummary` | `components/typing/SessionSummary.jsx` | the *personal* post-race card, beside the ranking |
| `Avatar`, `PresetTile` | `components/ui/Avatar.jsx` | every player tile and leaderboard row |
| `Modal` | `components/ui/Modal.jsx` | join-by-PIN, room settings, confirm-leave |
| `Button`, `IconButton` | `components/ui/Button.jsx` | all actions |
| `Segmented`, `Select`, `Switch` | `components/ui/` | lobby settings |
| `Card`, `Chip`, `ProgressBar`, `ProgressRing`, `EmptyState`, `Skeleton`, `SectionTitle` | `components/ui/Primitives.jsx` | layout throughout |
| `Confetti` | `components/ui/Confetti.jsx` | the win |
| `Counter`, `DecayCounter` | `components/ui/` | `DecayCounter` on every rival's WPM — it exists precisely because a raw WPM that snaps to 0 reads as a glitch, and eight of those would be eight glitches |
| `Toast` / `useToast` | `components/ui/Toast.jsx` | joins, leaves, kicks, host succession |
| `Reveal`, `Stagger`, `StaggerItem` | `components/ui/Motion.jsx` | roster and podium entrances |
| `Sparkline` | `components/charts/Charts.jsx` | per-player WPM trace in results |
| `useCopyToClipboard` | `lib/useCopyToClipboard.js` | the copy-PIN button, with its flash timing already solved |
| `cx`, `mmss`, `humanDuration`, `relativeTime`, `initials` | `lib/format.js` | throughout |
| `netWPM`, `accuracyPct`, `consistencyPct`, `countCorrect`, `gradeRun`, `weakestKeys`, `CHARS_PER_WORD` | `lib/typing.js` | identical maths to Practice, which is what makes the numbers comparable |
| `generatePassage`, `randomWords`, `randomQuote` | `lib/ai.js`, `lib/content.js` | passage selection |
| `supabase`, `currentUserId`, `signInAnonymously`, `isGuest` | `lib/supabase.js` | auth + client |
| `useAuth`, `openAuthModal` | `lib/auth.jsx` | the sign-in gate |
| `useStore().recordSession` | `lib/store.jsx` | feeds XP / streak / achievements |
| `is_admin()` pattern | `0002_admin.sql` | the template `in_battle()` copies |

### 15.1 The one existing file that must change

**`src/components/typing/useTypingEngine.js`** starts its clock on the first keystroke:

```js
const start = useCallback(() => {
  if (status !== 'idle') return;
  startedAt.current = Date.now();      // ← local, and triggered by the player
  setStatus('running');
}, [status]);
```

For a race, the clock must start at a *shared* instant and keystrokes must be refused
before it. Minimal backward-compatible change — two optional props, no behaviour change
for `Practice.jsx` or `CodeTyping.jsx`, which pass neither:

```js
export default function useTypingEngine({
  target, limitSeconds, autoIndent, stopOnError, sound, onFinish,
  /** When true, keystrokes are ignored until begin() is called. Practice never
   *  sets this; Battlefield does, so nobody can type during the countdown. */
  gated = false,
  /** Epoch ms the run is considered to have started, in *server* time. Elapsed
   *  is measured from here rather than from the frame that noticed GO, which is
   *  what makes eight machines agree on duration. */
  startAtMs = null,
  ...
}) {
  const start = useCallback(() => {
    if (status !== 'idle') return;
    if (gated && !armedRef.current) return;        // countdown still running
    startedAt.current = startAtMs ?? Date.now();
    setStatus('running');
  }, [status, gated, startAtMs]);

  const begin = useCallback(() => {                 // called by the countdown at GO
    armedRef.current = true;
    startedAt.current = startAtMs ?? Date.now();
    setStatus('running');
  }, [startAtMs]);

  return { ...existing, begin };
}
```

Roughly 15 lines. Everything else in the engine — the per-second WPM sampling, the
`keyStats` accumulation, the `finish()` result shape — is already exactly what Battlefield
needs, including `live.progress`, which the race track consumes directly.

---

## 16. New components required

### 16.1 Routes

```jsx
// src/App.jsx
const Battle     = lazy(() => import('./modules/battle/Battle.jsx'));      // hub: create + join
const BattleRoom = lazy(() => import('./modules/battle/BattleRoom.jsx'));  // every phase

<Route path="/battle"      element={<Battle />} />
<Route path="/battle/:pin" element={<BattleRoom />} />
```

**One route for all four phases, not four routes.** The phase is a function of
`room.status`, which is durable, so a refresh at any moment reconstructs the right screen
with no history entries to get wrong and no way to deep-link into a phase the room is not
actually in.

### 16.2 Component tree

```
modules/battle/
  Battle.jsx                 hub — create card, join-by-PIN card, your recent matches
  BattleRoom.jsx             phase router: lobby | countdown | race | results
  lobby/
    LobbyView.jsx
    RoomCodeCard.jsx         big PIN, copy button (useCopyToClipboard), share link, QR
    RosterGrid.jsx           up to 8 PlayerTile, empty slots drawn as outlines
    PlayerTile.jsx           Avatar + name + ready dot + presence dot + kick (admin)
    RoomSettings.jsx         max players, difficulty, length preset, regenerate passage
    StartButton.jsx          disabled + reason below 2 players
  race/
    CountdownOverlay.jsx     3·2·1·GO from starts_at, full-bleed, reduced-motion aware
    RaceView.jsx             stage + own stats + track
    RaceTrack.jsx            one lane per player, caret position = live.progress
    RivalLane.jsx            avatar puck sliding along a lane, WPM in DecayCounter
    AdminDashboard.jsx       admin-only table: name, WPM, acc, mistakes, %, status
    ConnectionBadge.jsx      live / reconnecting / offline
  results/
    ResultsView.jsx
    Podium.jsx               🥇🥈🥉 with Confetti when you are on it
    FinalTable.jsx           full ranking, DNF divider (§4.2), won_on note, ⚠ flags
    MatchStats.jsx           fastest WPM, cleanest run, average, total chars, duration
  BattleErrorState.jsx       BF### → copy, with the right recovery action per code

components/battle/
  PinInput.jsx               6 segmented boxes, auto-advance, paste-6-chars, uppercase
  ProgressLane.jsx           the primitive RaceTrack and AdminDashboard share
```

### 16.3 Integration into the existing gamification loop

Battlefield results must count, or the feature sits outside the product.

- **`store.jsx`** — on finish, call the existing `recordSession({ kind: 'battle', mode:
  'battle', ... })`. Sessions, XP, streak, daily counters, achievements and the cloud sync
  all work unchanged; `sessions.kind` is a free-text column and `sync.js` maps it
  verbatim.
- **`gamification.js`** — add a `kindFactor` entry for `battle` (suggest `1.15`: harder
  than prose, easier than code) and three achievements:

  ```js
  { id: 'battle-first', name: 'First Blood',  hint: 'Finish a Battlefield',        tier: 'bronze' },
  { id: 'battle-win',   name: 'Champion',     hint: 'Win a Battlefield',           tier: 'silver' },
  { id: 'battle-win-5', name: 'Undisputed',   hint: 'Win 5 Battlefields',          tier: 'gold'   },
  ```

  These need `battleWins` on the facts object in `evaluateAchievements`, derived from
  `sessions.filter(s => s.mode === 'battle' && s.rank === 1)` — which means `recordSession`
  should carry `rank` through. One extra field on the local session shape; the remote
  `sessions` table does not need a column because `battle_results.rank` is the durable copy.
- **`EMPTY_DAY` / `MISSION_POOL`** — add `battleRuns`, and a mission: *Win a Battlefield*
  (`goal: 1, xp: 90`).
- **`AppShell.jsx` `NAV_GROUPS`** — ✅ **done.** `{ to: '/battle', label: 'Battle', icon:
  Swords }` **replaces** the Chat entry in the Practice group rather than adding a ninth
  item. The mobile tab bar renders `NAV` with `flex-1` per entry, so a ninth would have
  given every tab 40 px at 360 px wide. Chat was the right entry to give up the slot: the
  `ChatFab` already floats the same coach on every route except `/chat` itself, so the
  capability is not lost — only its place in the nav moved.
- **`CommandPalette.jsx`** — ✅ **done.** `Open Battlefield — multiplayer` added to the
  Navigate group, alongside `Open the AI coach page`. The second one matters: `/chat` owns
  the thread history in `chat_messages` and the FAB does not, so removing it from the nav
  without a palette entry would have orphaned the route — the exact failure mode
  `PLAN.md` Phase 1 was written to fix. `Create a Battlefield` / `Join a Battlefield`
  arrive with Phase 2.
- **`App.jsx`** — ✅ **done.** `/battle` and `/battle/:pin` both resolve to
  `modules/battle/Battle.jsx`, currently a placeholder (§16.4).

### 16.4 Placeholder shipped ahead of the feature

`src/modules/battle/Battle.jsx` exists now so the new nav entry does not dead-end on
`<Route path="*">`'s redirect to Home. It renders the pitch, and — for anyone handed a
share link early — tells `/battle/:pin` visitors the room is not open yet rather than
bouncing them silently. Phase 2 replaces this file wholesale. It is 2.9 kB raw / 1.3 kB
gzipped and lazy-loaded, so it costs nothing until visited.

---

## 17. Missing architecture & integration gaps

The explicit deliverable. Each is a real gap between what the codebase has today and what
Battlefield needs, with the verification behind it.

| # | Gap | Evidence | Severity | Resolution |
|---|---|---|---|---|
| **G1** | **No realtime layer at all.** Not a single `channel(`, `broadcast`, `presence` or `realtime` reference in `src/`; `supabase_realtime` publication has **zero tables** on the live project | grep + live SQL query | **Blocking** | §6.6 adds three tables to the publication and sets `replica identity full`; §9 introduces `channel.js`. **This is new infrastructure, and it should be smoke-tested with two browsers before any Battlefield UI is written.** |
| **G2** | **No trusted compute.** Static Vite build; `vercel.json` has no functions, `supabase/` has no `functions/` | `vercel.json`, `ls supabase/` | **Blocking for anti-cheat** | v1: `SECURITY DEFINER` plpgsql is the trust boundary (§7). v2: a Vercel Function or Supabase Edge Function becomes the only writer and the client insert paths are dropped |
| **G3** | **No server-clock access.** Nothing in the app has ever needed one; every timestamp is `Date.now()` or `new Date().toISOString()` | `store.jsx`, `sync.js`, `useTypingEngine.js` | **Blocking for FR-12** | `battle_server_time()` RPC + the offset handshake in §10 |
| **G4** | **All metrics are client-reported.** `useTypingEngine` computes WPM/accuracy in the browser and `recordSession` trusts it. Acceptable for solo; a competitive surface changes the incentive | `useTypingEngine.js:76-103` | **High** | §14.2 recomputes WPM server-side from a server-owned clock; the rest is flagged, not trusted. The `ai_usage` comment in `0002` is the precedent and the migration path |
| **G5** | **Broadcast Authorization not configured.** Channel topics are currently unguarded because no channels exist | project settings | Medium | Use uuid topics (§9.4) as the baseline; enable Broadcast Authorization + a `realtime.messages` policy as the hardening step |
| **G6** | **`pg_cron` not enabled.** Nothing scheduled exists in this project | `list_extensions` shows no active cron | Medium | Opportunistic `battle_reap()` from `battle_create`/`battle_join` covers v1 at current scale (14 profiles). Enable `pg_cron` before real traffic |
| **G7** | **No rate limiting or bot protection anywhere.** No Turnstile, no BotID, no per-user throttles | whole repo | Medium | `BF010` room cap + client throttle for v1; Vercel BotID on `/battle` if abuse appears |
| **G8** | **RLS has no cross-user read pattern.** Every policy is `auth.uid() = user_id` or `is_admin()`; a room-mate is neither | `0001`–`0008` | Medium | `in_battle()` / `is_battle_admin()` (§6.4), `SECURITY DEFINER` for the same recursion reason `is_admin()` is |
| **G9** | **The typing engine cannot be externally started.** `start()` fires on the first keystroke and stamps `Date.now()` | `useTypingEngine.js:161-165` | Medium | §15.1 — two optional props, ~15 lines, no change for existing callers |
| **G10** | **`profiles` is not readable by a room-mate**, so a roster cannot be joined | `0001` "own rows" + `0005`'s comment on why the leaderboard is a view | Low | Snapshot `display_name` + `avatar` onto `battle_players` at join (§6.2) — same two fields the public leaderboard already exposes |
| **G11** | **Local store has no multiplayer concept.** `state.sessions` entries have no room, rank or opponent fields | `store.jsx` `EMPTY` | Low | Additive fields on the local session shape; the remote `sessions` table needs no migration |
| **G12** | **`sync.js` pushes whole snapshots on a 2 s debounce.** During a race that is a full profile upsert every couple of seconds, competing with the race's own writes | `sync.js:515-522` | Low | Suspend the write-through push while `status in ('countdown','active')`; resume and push once on settle. One `if` in `useCloudSync`, gated on a ref the battle hook sets |
| **G13** | ~~Mobile tab bar has no room for a ninth item~~ **Resolved** | `AppShell.jsx:330-359` | — | Battlefield **replaced** the Chat entry instead of adding a ninth. Count stays at 8. Chat keeps the `ChatFab` on every route and gains a command-palette entry so `/chat` is not orphaned. §16.3 |
| **G14** | **No test infrastructure of any kind.** No test runner in `package.json`, no test files | `package.json` | Medium | The `ranking.js` ↔ SQL twin (§11) is the first thing in this repo that genuinely needs a test. Adding Vitest for that one comparator is proportionate |
| **G15** | **Realtime quota is a real ceiling.** See below | arithmetic | Medium | Design to it (§18.1) rather than discovering it |

---

## 18. Performance

### 18.1 Realtime message budget — the number that actually binds

Broadcast fan-out, per match, at the proposed 2 Hz:

```
8 players × 2 msg/s × 120 s        = 1,920 sends
each delivered to the other 7      = 13,440 message deliveries per match
```

Supabase's free tier allows **2,000,000 messages/month**, so this is **≈ 148 matches per
month**. That is not a comfortable margin — it is a ceiling you would hit during a single
enthusiastic week.

Three changes, in order of value:

1. **1 Hz instead of 2 Hz.** Halves it to ~297 matches. A rival's puck moving once per
   second is still legible; the eye cannot follow eight things at 2 Hz anyway.
2. **Delta suppression.** Skip the tick when `progress_chars` has not changed (a player
   who paused, or finished). On a real match that is 15–25% of ticks.
3. **Coalesced host relay** *(only if needed)*: players send to the host, the host sends
   one merged frame to everyone. Turns 7 deliveries per send into 1 + 7, roughly halving
   again — at the cost of the host becoming a single point of failure. **Not recommended
   for v1**; note it and move on.

With 1 Hz + delta suppression: **~400 matches/month on the free tier**, ~5,000 on Pro. Ship
at 1 Hz.

### 18.2 Render cost

`TypingStage` re-renders on every keystroke — it maps `states` to per-character spans, and
its own comment explains that memoising them costs more than it saves at these lengths.
That is fine for one player's own text. It is **not** fine if a rival's tick at 1 Hz also
re-renders the stage.

**Rule: the race track never shares a React state root with the stage.** Rival ticks land
in a ref inside `useBattleChannel`, and `RaceTrack` reads them on its own
`requestAnimationFrame` loop with `transform: translateX()` on each lane puck. Zero React
renders on the typing path from rival data. The pattern already exists in this codebase —
`useTypingEngine` keeps mutable counters in refs and only lifts to state what the UI
renders, and `TypingStage` animates the caret with a spring rather than re-laying-out.

### 18.3 Own telemetry cost

The 1 Hz outbound tick reads from the engine's refs, so it costs no render either. The
durable checkpoint (every 3 s) is one small `update` on a row nobody else writes.

### 18.4 Database load

Per match: 1 room insert, ≤ 8 player inserts, ~8 × 40 checkpoint updates over 120 s
(≈ 320 updates), ≤ 8 result inserts, 1 settle update. Under 400 statements per match on
tables with at most eight rows each. With `replica identity full` on three small tables,
WAL volume is negligible.

The realistic risk is not throughput but the **Postgres Changes fan-out on checkpoint
updates**: eight subscribers × 320 updates = 2,560 delivered change events per match,
which counts against the same quota as §18.1. Mitigation: **do not publish
`battle_players` UPDATEs to clients** — subscribe with `event: 'INSERT'` and `event:
'DELETE'` only (roster membership), and let progress arrive over Broadcast where it
belongs. That single filter removes 2,560 of the ~16,000 messages a match costs.

### 18.5 Bundle

`/battle` is lazy-loaded like every other route. It adds no new dependency — realtime
ships inside `@supabase/supabase-js`, which is already in the bundle. Estimated added
weight: 18–25 KB gzipped of application code.

---

## 19. Phased implementation plan

Legend follows `PLAN.md`: `[ ]` todo · `[~]` in progress · `[x]` done.
Effort: **S** under an hour · **M** half a day · **L** a day or more.

### Phase 0 — De-risk realtime *(do this before anything else)* — **S**

Every later phase assumes a working realtime layer that this project has never had (G1).
Prove it in isolation, in a throwaway file, before building UI on top of it.

- [ ] `alter publication supabase_realtime add table ...` for one scratch table; confirm
      Postgres Changes arrives in a second browser
- [ ] Confirm Broadcast round-trips on a `battle:<uuid>` topic between two tabs
- [ ] Confirm Presence sync/leave fires on tab close
- [ ] Measure real propagation latency; **if p95 > 400 ms, raise the 3.5 s in §7.7**
- [ ] Confirm anonymous (guest) users can subscribe

**Exit:** two browsers, one channel, all three mechanisms observed working.

### Phase 1 — Schema and RPCs — **L**

- [ ] `0009_battlefield.sql`: three tables, indexes, `in_battle()`, `is_battle_admin()`,
      every RLS policy, publication + replica identity
- [ ] `battle_server_time`, `battle_mint_pin`, `battle_create`, `battle_join`,
      `battle_leave`, `battle_kick`, `battle_start`, `battle_finish`, `battle_settle`,
      `battle_leaderboard`, `battle_passage`, `battle_abort`, `battle_reap`
- [ ] `grant execute ... to authenticated` on each
- [ ] **Verify RLS by hand, the way `0001`'s header instructs**: as user A, attempt to
      select a room A is not in — must return zero rows, not an error
- [ ] Verify the `for update` capacity check with two concurrent `battle_join` calls
- [ ] `src/lib/battle/api.js` + `BATTLE_ERROR_COPY`

**Exit:** the whole lifecycle is drivable from the SQL editor and from `api.js` in a
console, with no UI.

### Phase 2 — Lobby — **L**

- [ ] `/battle` hub: create card, `PinInput`, recent matches
- [ ] `/battle/:pin` with the phase router
- [ ] `LobbyView`, `RoomCodeCard` (`useCopyToClipboard`), `RosterGrid`, `PlayerTile`,
      `RoomSettings`, `StartButton`
- [ ] `useBattleChannel` — Postgres Changes on rooms + player INSERT/DELETE, Presence
- [ ] `passage.js` with the 6 s AI budget and bank fallback
- [ ] Guest sign-in path for a signed-out visitor
- [ ] Every `BF###` mapped to copy and a recovery action

**Exit:** two devices, one PIN, roster visible on both in real time.

### Phase 3 — The race — **L**

- [ ] `useTypingEngine` gains `gated` / `startAtMs` / `begin()` (§15.1) — verify
      `Practice.jsx` and `CodeTyping.jsx` are byte-for-byte unchanged in behaviour
- [ ] `clock.js` offset handshake
- [ ] `CountdownOverlay` driven by `starts_at`, reduced-motion aware
- [ ] `RaceView`: `TypingStage` + `LiveStats compact` + `RaceTrack`
- [ ] Broadcast ticks at **1 Hz** with delta suppression (§18.1), rAF-driven lanes,
      no React renders from rival data (§18.2)
- [ ] Durable checkpoint every 3 s
- [ ] `AdminDashboard` panel
- [ ] Suspend `sync.js` write-through during the race (G12)

**Exit:** two devices start within 100 ms of each other and see each other move.

### Phase 4 — Results and the gamification loop — **M**

- [ ] `battle_settle` ranking materialised; `Podium`, `FinalTable`, `MatchStats`
- [ ] `won_on` explanation (§4.1); DNF divider (§4.2)
- [ ] `Confetti` on a podium finish, reusing the `SessionSummary` trigger convention
- [ ] `recordSession({ kind: 'battle', rank })` → XP, streak, achievements, sync
- [ ] `gamification.js`: `kindFactor`, three achievements, `battleRuns`, the win mission
- [ ] `ranking.js` ↔ SQL parity test (G14 — first test in the repo; Vitest)
- [ ] Nav entry + command palette, after resolving G13

**Exit:** a completed match awards XP, moves the streak, and can unlock *First Blood*.

### Phase 5 — Edges, hardening, polish — **L**

- [ ] Every case in §13, walked through by hand
- [ ] Reconnect + backoff; `ConnectionBadge`
- [ ] Admin succession (§13.5) with its toast
- [ ] `battle_reap()` wired opportunistically; `pg_cron` if enabled (G6)
- [ ] Flags surfaced on results rows (§14.6)
- [ ] Broadcast Authorization + `realtime.messages` policy (G5)
- [ ] Reduced-motion pass over countdown, lanes and podium (`useReducedMotionSafe`)
- [ ] a11y: `aria-live` on countdown and on finish announcements, focus management
      across phase transitions, the roster as a real list
- [ ] Mobile: race track at 360 px, `PinInput` with a numeric-friendly keyboard
- [ ] Load test: 8 real tabs, measure message count against §18.1

**Exit:** ship.

### Estimate

| Phase | Effort |
|---|---|
| 0 — De-risk realtime | S |
| 1 — Schema + RPCs | L |
| 2 — Lobby | L |
| 3 — Race | L |
| 4 — Results + gamification | M |
| 5 — Hardening | L |

**≈ 4–5 focused days**, and that is only credible because §15 reuses the entire typing
surface. Written from scratch this is two weeks.

---

## 20. Open decisions

Four calls that change the work. **#3 is now decided and shipped**; the other three are
genuinely yours to make, and everything above assumes the first option in each.

1. **Mistakes-first ranking** (§4.1) — ship as specified, or speed-first? As specified, a
   40 WPM flawless run beats a 130 WPM run with one typo.
2. **1 Hz vs 2 Hz telemetry** (§18.1) — 2 Hz feels marginally smoother and costs 148
   matches/month on the free tier instead of ~400.
3. ~~**Mobile nav** (G13)~~ — **decided.** Battlefield takes Chat's nav slot; the bar stays
   at 8 items and `/chat` moves to the command palette. Shipped.
4. **`hide_from_leaderboard` inside a room** (§14.8) — this PRD says the toggle does not
   apply to a Battlefield you chose to join. The opposite reading is defensible.
