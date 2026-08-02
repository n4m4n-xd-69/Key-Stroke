-- Makes a session's identity its content, not a hash the client computed.
--
-- 0006 added a unique index on the content while the client was still
-- upserting against `(user_id, client_id)`. Those disagree for every row
-- written before the key fix: the stored client_id is the old hash, the client
-- now sends the new one, so `on conflict (user_id, client_id)` finds no match,
-- falls through to a plain insert, and trips the content index — a 409 on
-- every sync.
--
-- Rather than reconcile two identities, keep one. A user cannot finish two runs
-- in the same millisecond, so `(user_id, ts)` *is* the identity. Targeting plain
-- columns also lets PostgREST name it as a conflict target, which an expression
-- index could never be, and it retires the whole float-precision problem: the
-- comparison is now between timestamps, not between strings a round trip
-- through Postgres reformats.
--
-- `client_id` stays on the table. It is harmless, it is what older rows are
-- keyed by, and dropping a column to tidy up is not worth a rewrite.

drop index if exists public.sessions_user_content_uniq;

-- Collapse anything the mismatch created between 0006 and now, keeping the
-- earliest row so ordering is stable.
with ranked as (
  select id, row_number() over (partition by user_id, ts order by id) as n
    from public.sessions
)
delete from public.sessions s
 using ranked r
 where s.id = r.id and r.n > 1;

create unique index if not exists sessions_user_ts_uniq
  on public.sessions (user_id, ts);
