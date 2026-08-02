-- Repairs, and then prevents, duplicated sessions.
--
-- The client's idempotency key hashed `ts` and `wpm` exactly as they appeared
-- in the browser. Neither survives a round trip: `ts` comes back in Postgres
-- format rather than ISO, and `wpm` is stored in a `real` column, so
-- 219.35483870967741 returns as 219.355. A pulled session therefore hashed to
-- a different client_id than it had going up, `on conflict (user_id, client_id)`
-- never matched, and the row was inserted again — once per pull-then-push
-- cycle, without bound.
--
-- sync.js now normalises both before hashing. This file cleans up what the old
-- key already created and adds a constraint so the whole class of bug cannot
-- come back through some other route.

-- ── 1. Collapse existing duplicates ─────────────────────────────────────────
-- Identity is the content, not the key: same user, same instant, same mode,
-- same size. Keeps the earliest row so `created_at`-style ordering is stable.
with ranked as (
  select id,
         row_number() over (
           partition by user_id, ts, coalesce(mode, ''), chars
           order by id
         ) as n
    from public.sessions
)
delete from public.sessions s
 using ranked r
 where s.id = r.id
   and r.n > 1;

-- ── 2. Make it impossible ───────────────────────────────────────────────────
-- A single user cannot legitimately finish two runs of the same mode and length
-- in the same millisecond, so this rejects a re-insert regardless of what the
-- client computed for client_id. Belt and braces: the client fix alone would
-- do, but silent unbounded duplication is worth closing at the schema level.
create unique index if not exists sessions_user_content_uniq
  on public.sessions (user_id, ts, coalesce(mode, ''), chars);

-- ── 3. Restore XP lost to the write-before-read race ────────────────────────
-- A device with empty local state but a live session pushed a blank snapshot
-- two seconds after mount, while the pull was still in flight, zeroing the
-- remote total. sync.js now gates every write behind a completed hydrate.
--
-- Where sessions survive, the true total is recomputable from them. Where they
-- do not, the row is left alone rather than guessed at.
update public.profiles p
   set xp = sub.total,
       updated_at = now()
  from (
    select user_id, sum(xp)::int as total
      from public.sessions
     group by user_id
  ) as sub
 where p.id = sub.user_id
   and sub.total > p.xp;
