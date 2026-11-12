-- La promo se voit toujours : c'est ainsi que les AET se retrouvent entre collègues
-- (décision du 12 novembre 2026). Le réglage show_entry_year reste en base pour les
-- anciens clients, mais il vaut toujours vrai et l'annuaire ne le lit plus.

update public.user_privacy_settings set show_entry_year = true where not show_entry_year;

alter table public.user_privacy_settings
  add constraint user_privacy_settings_promo_visible check (show_entry_year);

-- Même vue que 20261109000000_directory_visibility.sql, l'année d'entrée sans condition
create or replace view public.directory_entries
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
  u.entry_year,
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
