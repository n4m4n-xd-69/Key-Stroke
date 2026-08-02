-- Avatars, and the right to stay off the leaderboard.
--
-- `avatar` holds one of two things: a preset id (`preset:aurora`) or a data URI
-- for an uploaded image. Text rather than a storage bucket because the uploads
-- are downscaled to 160px in the browser before they ever leave it — a few KB —
-- and a bucket would add a second failure mode, its own RLS surface and a
-- cleanup problem for a feature that does not need any of it.

alter table public.profiles
  add column if not exists avatar text,
  -- Appearing on a public board should be a choice, not a consequence of
  -- typing your name into an onboarding box. Defaults to visible because that
  -- is what the leaderboard is for, but it is one toggle to leave.
  add column if not exists hide_from_leaderboard boolean not null default false;

-- Rebuilt to carry the avatar and to honour the opt-out. `create or replace`
-- cannot drop or reorder existing columns, so the view is replaced outright.
drop view if exists public.leaderboard;

create view public.leaderboard as
  select
    p.display_name,
    p.avatar,
    p.xp,
    rank() over (order by p.xp desc) as rank
  from public.profiles p
  where p.xp > 0
    and p.hide_from_leaderboard = false
    and nullif(trim(p.display_name), '') is not null
  order by p.xp desc
  limit 100;

comment on view public.leaderboard is
  'Public ranking: display name, avatar and XP only. Excludes ids, emails, '
  'settings and streak data, and anyone who has opted out.';

grant select on public.leaderboard to anon, authenticated;
