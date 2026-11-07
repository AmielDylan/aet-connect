-- Données de départ de la base LOCALE (supabase start / supabase db reset).
-- Jamais appliqué en production.

-- Écoles : données publiques de référence, copiées de la production le 2026-11-07
insert into public.schools (id, name_fr, city, country, established_year, is_active, acronym, flag, description) values
  ('5fb5fcdc-1d60-4a39-9b67-6d2312b18dc7', 'Collège Militaire Eyadema', 'Tchitchao', 'Togo', 1979, true, 'CME', '🇹🇬', 'Établissement secondaire interne réservé aux garçons enfants de militaires au début, puis à tous à partir de 1996, offrant enseignement de la 6e en terminale, combiné à une formation morale et militaire. Admission via un concours très sélectif organisé chaque été dans plusieurs villes.'),
  ('860e349a-4d78-497e-a5f9-a39044119044', 'École Militaire Préparatoire Technique', 'Bingerville', 'Côte d''Ivoire', 1962, true, 'EMPT', '🇨🇮', 'Internat militaire dès la classe de 6e, ouvert aux garçons et filles (à partir de 2013-2014). L''EMPT combine enseignement général et technique (collège), avec formation physique, morale et militaire pour intégrer ensuite les Forces armées ivoiriennes ou poursuivre des études. Le concours d''entrée est très sélectif dès le CM2. L''établissement accueille des élèves venus de plusieurs pays de la sous-région.'),
  ('27a770a1-9c36-48c8-8c6c-b2305d124c09', 'Lycée Militaire des Jeunes Filles Général Mathieu Kérékou', 'Natitingou', 'Bénin', 2000, true, 'LMJF-GMK', '🇧🇯', 'Unique lycée militaire exclusivement féminin au Bénin. Formation secondaire (collège et lycée) doublée d''un encadrement militaire. Admission par concours basé sur les résultats du CEP ; élèves sélectionnées parmi les meilleures du département et de la sous-région.'),
  ('87cc9599-8781-4481-9930-9cea39d93f3e', 'Prytanée militaire Charles N''Tchoréré de Saint‑Louis', 'Saint-Louis', 'Sénégal', 1973, true, 'PMS', '🇸🇳', 'Lycée militaire prestigieux, réputé pour son sélectivité : 50 élèves choisis chaque année parmi plus de 3 000 candidats sénégalais, complétés par une quinzaine issus de pays partenaires. Formation de la 6e à la terminale avec instruction militaire. Près de 20 % des diplômés rejoignent l''armée après le bac ; considéré comme la meilleure institution du Sénégal.'),
  ('627bff1f-bacc-4a81-b7a5-cf6a0b06bd84', 'Prytanée militaire de Bembéréké', 'Bembéréké', 'Bénin', 1986, true, 'PMB', '🇧🇯', 'Collège-lycée militaire visant à former l''élite scolaire aux carrières civiles et militaires. Combinaison d''enseignement général et de formation militaire débouchant sur grade de sergent pour les admis dans l''armée. Admission par concours très sélectif basé sur les résultats du CEP.'),
  ('d91bac52-c6d3-4df7-8281-6b552b9569a5', 'Prytanée militaire de Kadiogo', 'Kamboincè', 'Burkina Faso', 1992, true, 'PMK', '🇧🇫', 'Internat militaire d''enseignement secondaire sous tutelle conjointe du ministère de la Défense et de l''Éducation. Forme moralement, physiquement et intellectuellement des cadres civils et militaires. Ouvert aux filles depuis 2007-2008.'),
  ('841ccc05-a3f8-4f74-86ea-e58d89f21533', 'Prytanée militaire de Kati', 'Kati', 'Mali', 1981, true, 'PMK (Kati)', '🇲🇱', 'Lycée militaire interne très sélectif, formant des élèves jusqu''au baccalauréat avec grade militaire (sergent ou aspirant), ouvert aux filles depuis 1998. Taux de réussite au bac exceptionnel, quasi 100 % certaines années.'),
  ('7f081ca5-2e61-44dd-be1a-2cf43137f67f', 'Prytanée Militaire de Libreville', 'Libreville', 'Gabon', 2001, true, 'PML', '🇬🇦', 'Établissement public d''enseignement secondaire (collège et lycée) sous la présidence gabonaise, ouvert à filles et garçons sans distinction d''origine. L''objectif est de former l''élite civile et militaire via un enseignement général, un BEPC et baccalauréat, combinés à une instruction militaire destinée à préparer à des carrières dans les forces armées. Recrutement sur concours en classe de 6e (ou équivalent).'),
  ('7ee08d3c-9b7f-4121-8550-fd40cf3e0c47', 'Prytanée militaire de Niamey', 'Niamey', 'Niger', 1996, true, 'PMN', '🇳🇪', 'Établissement d''enseignement secondaire rattaché au ministère de la Défense, alliant cursus général (collège et lycée) et formation militaire, ouvert aux garçons et filles depuis 2010.')
;

-- ═══════════════════════════════════════════════════════════════════
-- Membres FICTIFS (base locale uniquement)
-- Mot de passe commun : Motdepasse123!
-- Le trigger handle_new_user crée la fiche public.users à partir des metadata.
-- ═══════════════════════════════════════════════════════════════════

-- PMB = Prytanée militaire de Bembéréké, promo 2005
-- LMJF = Lycée Militaire des Jeunes Filles, promo 2007
with seed_users (id, email, meta) as (
  values
    ('a0000000-0000-4000-8000-000000000001'::uuid, 'admin@aetconnect.test',
     '{"first_name":"Ada","last_name":"Admin","school_id":"627bff1f-bacc-4a81-b7a5-cf6a0b06bd84","entry_year":"2005","role":"admin","is_ambassador":false,"max_codes_allowed":999}'::jsonb),
    ('a0000000-0000-4000-8000-000000000002'::uuid, 'ambassadeur@aetconnect.test',
     '{"first_name":"Abou","last_name":"Ambassadeur","school_id":"627bff1f-bacc-4a81-b7a5-cf6a0b06bd84","entry_year":"2005","role":"alumni","is_ambassador":true,"max_codes_allowed":15,"current_city":"Cotonou","current_country":"Bénin"}'::jsonb),
    ('a0000000-0000-4000-8000-000000000003'::uuid, 'alumni.pmb@aetconnect.test',
     '{"first_name":"Aminata","last_name":"Alumni","school_id":"627bff1f-bacc-4a81-b7a5-cf6a0b06bd84","entry_year":"2005","role":"alumni","is_ambassador":false,"max_codes_allowed":3,"current_city":"Paris","current_country":"France"}'::jsonb),
    ('a0000000-0000-4000-8000-000000000004'::uuid, 'alumni.cachee@aetconnect.test',
     '{"first_name":"Awa","last_name":"Discrète","school_id":"27a770a1-9c36-48c8-8c6c-b2305d124c09","entry_year":"2007","role":"alumni","is_ambassador":false,"max_codes_allowed":3}'::jsonb)
)
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
select
  '00000000-0000-0000-0000-000000000000', id, 'authenticated', 'authenticated', email,
  extensions.crypt('Motdepasse123!', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb, meta, now(), now(),
  '', '', '', ''
from seed_users;

-- Identités email (nécessaires pour se connecter avec signInWithPassword)
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), id, id::text,
       jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
       'email', now(), now(), now()
from auth.users
where email like '%@aetconnect.test';

-- Awa ne veut pas apparaître dans l'annuaire
insert into public.user_privacy_settings (user_id, show_in_directory)
values ('a0000000-0000-4000-8000-000000000004', false);

-- ═══════════════════════════════════════════════════════════════════
-- Codes d'invitation dans tous les états
-- ═══════════════════════════════════════════════════════════════════
insert into public.invitation_codes
  (code, school_id, entry_year, created_by_user_id, is_admin_code, max_uses, current_uses, expires_at, is_active, used_by_user_id, used_at)
values
  -- neuf, émis par l'ambassadeur pour sa promo
  ('AET-NEUF-2345', '627bff1f-bacc-4a81-b7a5-cf6a0b06bd84', '2005', 'a0000000-0000-4000-8000-000000000002', false, 1, 0, null, true, null, null),
  -- déjà utilisé (par Aminata)
  ('AET-UTIL-2345', '627bff1f-bacc-4a81-b7a5-cf6a0b06bd84', '2005', 'a0000000-0000-4000-8000-000000000002', false, 1, 1, null, true, 'a0000000-0000-4000-8000-000000000003', now() - interval '30 days'),
  -- expiré
  ('AET-EXPR-2345', '627bff1f-bacc-4a81-b7a5-cf6a0b06bd84', '2005', 'a0000000-0000-4000-8000-000000000002', false, 1, 0, now() - interval '1 day', true, null, null),
  -- révoqué
  ('AET-REVQ-2345', '627bff1f-bacc-4a81-b7a5-cf6a0b06bd84', '2005', 'a0000000-0000-4000-8000-000000000002', false, 1, 0, null, false, null, null),
  -- code admin universel : la personne choisit sa promo à l'inscription
  ('AET-TOUS-2345', null, null, 'a0000000-0000-4000-8000-000000000001', true, 100, 0, null, true, null, null);
