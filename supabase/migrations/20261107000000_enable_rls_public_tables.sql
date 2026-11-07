-- Active le Row Level Security sur toutes les tables du schéma public.
--
-- Avant cette migration, le rôle `anon` (dont la clé est publique, incluse dans le
-- bundle du frontend) pouvait lire, insérer, modifier et supprimer n'importe quelle
-- ligne via l'API REST de Supabase.
--
-- Le backend Express utilise la clé service_role, qui contourne le RLS : il n'est pas
-- affecté. Les triggers SECURITY DEFINER (handle_new_user, handle_delete_user)
-- s'exécutent en tant que propriétaire des tables et ne sont pas affectés non plus.
--
-- Seuls deux accès directs depuis le navigateur existent (frontend/store/auth-store.ts) :
--   - lecture de sa propre ligne dans `users`
--   - lecture de l'école associée via la jointure `schools`
-- Ils reçoivent une policy explicite ci-dessous. Tout le reste est fermé par défaut.

begin;

alter table public.access_requests       enable row level security;
alter table public.deletion_requests     enable row level security;
alter table public.event_participants    enable row level security;
alter table public.events                enable row level security;
alter table public.invitation_codes      enable row level security;
alter table public.pending_registrations enable row level security;
alter table public.schools               enable row level security;
alter table public.trigger_logs          enable row level security;
alter table public.user_privacy_settings enable row level security;
alter table public.users                 enable row level security;

-- Un membre connecté peut lire sa propre fiche (et rien d'autre).
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- La liste des écoles est une donnée de référence publique.
create policy "schools_select_all"
  on public.schools
  for select
  to anon, authenticated
  using (true);

commit;
