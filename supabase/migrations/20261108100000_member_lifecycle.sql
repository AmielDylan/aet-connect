-- Cycle de vie du compte membre : la base garde public.users synchronisée avec auth.users.
--
-- Création : le trigger est le SEUL à écrire la fiche. Il ne prend dans les métadonnées
-- que l'identité (prénom, nom, école, année) ; les droits (rôle, ambassadeur, quota)
-- partent toujours des valeurs de base et ne sont accordés qu'ensuite par le backend.
-- S'il échoue, il lève une erreur : la création du compte auth est annulée avec lui.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.users (
    id, email, first_name, last_name, school_id, entry_year,
    role, is_ambassador, is_active, max_codes_allowed, created_at, updated_at
  ) values (
    new.id,
    new.email,
    m->>'first_name',
    m->>'last_name',
    nullif(m->>'school_id', '')::uuid,
    m->>'entry_year',
    'alumni',
    false,
    true,
    3,
    new.created_at,
    coalesce(new.updated_at, new.created_at)
  );

  insert into public.user_privacy_settings (user_id) values (new.id);

  return new;
end
$$;

-- Suppression : supprimer le compte auth suffit, la base fait le reste.
--   - les codes encore valables émis par le membre sont révoqués ;
--   - sa fiche est supprimée ; les clés étrangères ci-dessous décident de ce qui survit.
create or replace function public.handle_delete_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.invitation_codes
  set is_active = false
  where created_by_user_id = old.id
    and public.invitation_code_status(invitation_codes) = 'valid';

  delete from public.users where id = old.id;
  return old;
end
$$;

-- Ce qui survit à la suppression d'un membre :
-- le code qu'il a utilisé reste « utilisé » (son parrain ne récupère pas de place) ;
alter table public.invitation_codes drop constraint invitation_codes_used_by_user_id_fkey;
alter table public.invitation_codes add constraint invitation_codes_used_by_user_id_fkey
  foreign key (used_by_user_id) references public.users(id) on delete set null;
-- les codes qu'il a émis restent, sans émetteur (ceux encore valables sont révoqués ci-dessus) ;
alter table public.invitation_codes drop constraint invitation_codes_created_by_user_id_fkey;
alter table public.invitation_codes add constraint invitation_codes_created_by_user_id_fkey
  foreign key (created_by_user_id) references public.users(id) on delete set null;
-- sa demande de suppression reste comme trace, avec une copie de son identité.
alter table public.deletion_requests alter column user_id drop not null;
alter table public.deletion_requests drop constraint deletion_requests_user_id_fkey;
alter table public.deletion_requests add constraint deletion_requests_user_id_fkey
  foreign key (user_id) references public.users(id) on delete set null;
alter table public.deletion_requests
  add column requester_email text,
  add column requester_name text;

update public.deletion_requests d
set requester_email = u.email, requester_name = u.first_name || ' ' || u.last_name
from public.users u
where u.id = d.user_id and d.requester_email is null;

create or replace function public.snapshot_deletion_requester()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select u.email, u.first_name || ' ' || u.last_name
  into new.requester_email, new.requester_name
  from public.users u
  where u.id = new.user_id;
  return new;
end
$$;

create trigger deletion_requests_snapshot_requester
  before insert on public.deletion_requests
  for each row execute function public.snapshot_deletion_requester();

-- Les membres inscrits avant cette migration reçoivent leurs réglages par défaut.
insert into public.user_privacy_settings (user_id)
select u.id from public.users u
where not exists (select 1 from public.user_privacy_settings p where p.user_id = u.id);

-- Tables mortes : journal de débogage du trigger, et inscriptions en attente jamais utilisées.
drop table if exists public.trigger_logs;
drop table if exists public.pending_registrations;
