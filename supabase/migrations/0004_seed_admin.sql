-- Promotes the first admin.
--
-- 0002 deliberately gives `user_roles` no insert/update policy: there is no
-- self-service route to admin, by design. Seeding one is therefore a migration
-- rather than something the app can do, and doing it here — instead of by hand
-- in the SQL editor — means the promotion is versioned, reviewable, and
-- reproducible on a rebuilt database.
--
-- Matching on email rather than a hardcoded uuid keeps this readable and lets
-- it work against a freshly seeded environment where the id differs. Every
-- statement is guarded on the account existing, so this is a no-op on any
-- database where that user has not been created.

do $$
declare
  admin_id uuid;
begin
  select id into admin_id from auth.users where email = 'admin@keystroke.ai';

  if admin_id is null then
    raise notice 'admin@keystroke.ai not found — nothing to promote';
    return;
  end if;

  -- The role itself. `on conflict` so re-running is harmless, and so a
  -- previously demoted account is restored rather than silently skipped.
  insert into public.user_roles (user_id, role)
  values (admin_id, 'admin')
  on conflict (user_id) do update set role = 'admin';

  -- Display name, in both places the app reads it from.
  --
  -- `profiles` is what the admin panel and cloud sync read; the row may not
  -- exist yet, because the app creates it on first sync rather than at signup.
  insert into public.profiles (id, display_name)
  values (admin_id, 'Admin')
  on conflict (id) do update set display_name = 'Admin', updated_at = now();

  -- `raw_user_meta_data.full_name` is what the account menu shows immediately
  -- after signing in, before any profile row has been pulled. Without this the
  -- header would fall back to the email until the first sync completed.
  update auth.users
     set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb)
                              || jsonb_build_object('full_name', 'Admin')
   where id = admin_id;

  raise notice 'promoted % to admin', admin_id;
end $$;
