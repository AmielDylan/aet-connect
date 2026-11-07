-- Module Code d'invitation : la règle de validité d'un code vit ici, une seule fois.
-- Utilisée par le quota (codes qui comptent) et par la consommation atomique.

-- Un code universel (émis par un admin) n'a ni école ni année d'entrée.
alter table public.invitation_codes alter column entry_year drop not null;
alter table public.invitation_codes
  add constraint invitation_codes_promo_complete
  check ((school_id is null) = (entry_year is null));

-- Le code porte la décision de l'admin, prise à l'approbation d'une demande d'accès :
-- la personne qui l'utilise devient ambassadrice.
alter table public.invitation_codes
  add column grants_ambassador boolean not null default false;

-- 'valid' | 'revoked' | 'expired' | 'exhausted'
create or replace function public.invitation_code_status(c public.invitation_codes)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when not coalesce(c.is_active, false) then 'revoked'
    when c.current_uses >= c.max_uses then 'exhausted'
    when c.expires_at is not null and c.expires_at <= now() then 'expired'
    else 'valid'
  end
$$;

-- Nombre de codes qui comptent dans le quota d'un membre :
-- ceux déjà utilisés, et ceux encore valables. Un code expiré ou révoqué
-- sans avoir servi rend sa place.
create or replace function public.invitation_quota_used(p_member_id uuid)
returns integer
language sql
stable
set search_path = ''
as $$
  select count(*)::integer
  from public.invitation_codes c
  where c.created_by_user_id = p_member_id
    and (c.current_uses > 0 or public.invitation_code_status(c) = 'valid')
$$;

-- Consommation atomique, étape 1 : verrouille la ligne, vérifie, prend un usage.
-- Deux appels simultanés sur un code à usage unique : le second attend le verrou,
-- puis voit le code épuisé.
-- Erreurs : message « invitation:<raison> » (unknown | revoked | expired | exhausted).
create or replace function public.reserve_invitation_code(p_code text)
returns table (id uuid, school_id uuid, entry_year text, grants_ambassador boolean)
language plpgsql
set search_path = ''
as $$
declare
  c public.invitation_codes;
  v_status text;
begin
  select * into c from public.invitation_codes ic where ic.code = p_code for update;
  if not found then
    raise exception 'invitation:unknown';
  end if;

  v_status := public.invitation_code_status(c);
  if v_status <> 'valid' then
    raise exception 'invitation:%', v_status;
  end if;

  update public.invitation_codes ic set current_uses = ic.current_uses + 1 where ic.id = c.id;
  return query select c.id, c.school_id, c.entry_year, c.grants_ambassador;
end
$$;

-- Étape 2a, si la création du compte a échoué : rend l'usage pris.
create or replace function public.release_invitation_code(p_code_id uuid)
returns void
language sql
set search_path = ''
as $$
  update public.invitation_codes
  set current_uses = greatest(current_uses - 1, 0)
  where id = p_code_id
$$;

-- Étape 2b, si le compte est créé : lie le code au nouveau membre et applique
-- ce que le code accorde (rôle d'ambassadeur, avec son quota).
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
    update public.users
    set is_ambassador = true,
        max_codes_allowed = greatest(coalesce(max_codes_allowed, 0), p_ambassador_quota)
    where id = p_member_id;
  end if;
end
$$;

-- Ces fonctions ne sont appelées que par le backend (service_role) : sans ces
-- revoke, l'API REST les exposerait à la clé anon publique.
revoke execute on function public.invitation_code_status(public.invitation_codes) from public, anon, authenticated;
revoke execute on function public.invitation_quota_used(uuid) from public, anon, authenticated;
revoke execute on function public.reserve_invitation_code(text) from public, anon, authenticated;
revoke execute on function public.release_invitation_code(uuid) from public, anon, authenticated;
revoke execute on function public.complete_invitation_redemption(uuid, uuid, integer) from public, anon, authenticated;
grant execute on function public.invitation_code_status(public.invitation_codes) to service_role;
grant execute on function public.invitation_quota_used(uuid) to service_role;
grant execute on function public.reserve_invitation_code(text) to service_role;
grant execute on function public.release_invitation_code(uuid) to service_role;
grant execute on function public.complete_invitation_redemption(uuid, uuid, integer) to service_role;
