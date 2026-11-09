-- Annuaire : « qui voit quoi » est décidé par la base, en un seul endroit.
--
-- La vue directory_entries ne contient que les membres actifs qui acceptent d'apparaître
-- dans l'annuaire, avec leurs champs déjà masqués. Les filtres et la pagination
-- s'appliquent APRÈS ce masquage : une page est toujours pleine, le total est exact,
-- et filtrer par année ou par ville ne révèle pas une valeur que le membre a cachée.
--
-- Règle de masquage : email et téléphone seulement si le membre les a rendus visibles ;
-- les autres champs sauf s'il les a cachés.

-- Réglages toujours renseignés (les valeurs par défaut existaient déjà)
update public.user_privacy_settings set
  show_email = coalesce(show_email, false),
  show_phone = coalesce(show_phone, false),
  show_current_location = coalesce(show_current_location, true),
  show_bio = coalesce(show_bio, true),
  show_linkedin = coalesce(show_linkedin, true),
  show_entry_year = coalesce(show_entry_year, true),
  show_in_directory = coalesce(show_in_directory, true);

alter table public.user_privacy_settings
  alter column show_email set not null,
  alter column show_phone set not null,
  alter column show_current_location set not null,
  alter column show_bio set not null,
  alter column show_linkedin set not null,
  alter column show_entry_year set not null,
  alter column show_in_directory set not null;

-- Recherche sans accents : « kerekou » trouve « Kérékou »
create extension if not exists unaccent with schema extensions;

create view public.directory_entries
with (security_invoker = true)
as
select
  u.id,
  u.first_name,
  u.last_name,
  u.avatar_url,
  u.is_ambassador,
  u.school_id,
  s.name_fr as school_name,
  s.country as school_country,
  s.acronym as school_acronym,
  s.flag as school_flag,
  case when p.show_entry_year then u.entry_year end as entry_year,
  case when p.show_current_location then u.current_city end as current_city,
  case when p.show_current_location then u.current_country end as current_country,
  case when p.show_bio then u.bio end as bio,
  case when p.show_linkedin then u.linkedin_url end as linkedin_url,
  case when p.show_email then u.email end as email,
  case when p.show_phone then u.phone end as phone,
  lower(extensions.unaccent(u.first_name || ' ' || u.last_name)) as search_text,
  u.created_at
from public.users u
join public.user_privacy_settings p on p.user_id = u.id
left join public.schools s on s.id = u.school_id
where u.is_active and p.show_in_directory;

-- Lue uniquement par le backend (service_role) : jamais exposée à la clé publique
revoke all on public.directory_entries from anon, authenticated;
grant select on public.directory_entries to service_role;
