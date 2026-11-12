-- Un seul ambassadeur par promo (école + année d'entrée).
--
-- Si une promo en compte déjà plusieurs, la migration s'arrête : c'est à l'administration
-- de choisir qui garde le statut, la base ne le retire à personne.
do $$
begin
  if exists (
    select 1 from public.users
    where is_ambassador and school_id is not null
    group by school_id, entry_year
    having count(*) > 1
  ) then
    raise exception 'Une promo compte plusieurs ambassadeurs : retirer le statut en trop avant cette migration.';
  end if;
end
$$;

create unique index users_un_ambassadeur_par_promo
  on public.users (school_id, entry_year)
  where is_ambassador;

-- Un code « ambassadeur » utilisé alors que la promo en a déjà un : le compte est créé,
-- sans le statut (au lieu d'échouer sur l'index).
create or replace function public.complete_invitation_redemption(p_code_id uuid, p_member_id uuid, p_ambassador_quota integer)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_grants boolean;
begin
  update public.invitation_codes
  set used_by_user_id = p_member_id, used_at = now()
  where id = p_code_id
  returning grants_ambassador into v_grants;

  if v_grants then
    update public.users u
    set is_ambassador = true,
        max_codes_allowed = greatest(coalesce(u.max_codes_allowed, 0), p_ambassador_quota)
    where u.id = p_member_id
      and not exists (
        select 1 from public.users a
        where a.is_ambassador
          and a.school_id = u.school_id
          and a.entry_year = u.entry_year
          and a.id <> u.id
      );
  end if;
end
$$;
