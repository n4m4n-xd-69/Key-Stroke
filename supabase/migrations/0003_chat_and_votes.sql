-- Chat transcripts and the Learn beta vote.
--
-- Both follow the shape 0001 established: own-rows write, admins read all via
-- is_admin(). The one departure is beta_vote_tally, which is readable by
-- everyone — the whole point of the vote is showing the running split back to
-- the people casting it.

/* ── Chat ────────────────────────────────────────────────────────────────
   One row per message. `thread` groups a conversation and is a plain text key
   rather than a foreign key to a threads table: threads carry no data of their
   own beyond their messages, and a separate table would buy nothing but a join.
   `surface` records which panel it came from, so the coach, the code rail and
   the help assistant can be told apart later. */
create table if not exists public.chat_messages (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  thread      text not null default 'default',
  surface     text,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  reasoning   text,
  created_at  timestamptz not null default now()
);

create index if not exists chat_messages_user_thread_idx
  on public.chat_messages (user_id, thread, created_at);

alter table public.chat_messages enable row level security;

drop policy if exists "own rows" on public.chat_messages;
create policy "own rows" on public.chat_messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "admins read all" on public.chat_messages;
create policy "admins read all" on public.chat_messages
  for select using (public.is_admin());

/* ── Beta vote ───────────────────────────────────────────────────────────
   One vote per person per feature, enforced by the unique constraint rather
   than by the client, so a second submission updates rather than inflating the
   count. Guests count: they hold a real auth.users row, which is the reason
   anonymous sign-in exists here at all. */
create table if not exists public.beta_votes (
  user_id     uuid not null references auth.users (id) on delete cascade,
  feature     text not null,
  vote        boolean not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (user_id, feature)
);

alter table public.beta_votes enable row level security;

drop policy if exists "own rows" on public.beta_votes;
create policy "own rows" on public.beta_votes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

/* The tally is deliberately public and deliberately a view: it exposes counts
   only, never who voted which way, so "show me the split" needs no privileged
   access and leaks nothing about individuals.

   security_invoker stays OFF here (the default). The view must be able to read
   rows the caller cannot see directly — that is the entire point of aggregating
   them — and it returns no user_id, so there is nothing to attribute. */
create or replace view public.beta_vote_tally as
  select
    feature,
    count(*)                        as total,
    count(*) filter (where vote)    as yes,
    count(*) filter (where not vote) as no
  from public.beta_votes
  group by feature;

grant select on public.beta_vote_tally to anon, authenticated;
