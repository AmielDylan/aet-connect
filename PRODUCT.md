# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Les **Anciens Enfants de Troupe** (AET) : anciens élèves des écoles militaires préparatoires d'Afrique de l'Ouest et centrale, aujourd'hui adultes, civils ou militaires, en Afrique comme dans la diaspora. Les 9 écoles actuellement référencées sont au Togo, en Côte d'Ivoire, au Bénin (2), au Sénégal, au Burkina Faso, au Mali, au Gabon et au Niger. Un membre appartient à une **promo** (école + année d'entrée).

Ils viennent, à parts égales, pour deux choses :
- **la fraternité** : retrouver ses camarades de promo et d'école, garder le lien ;
- **l'entraide** : trouver un ancien dans une ville, un pays ou un domaine pour un conseil, une introduction, une opportunité.

Rôles dans le produit : membre (alumni), ambassadeur de promo (invite davantage), modérateur, administrateur (valide les demandes, gère écoles et membres).

## Product Purpose

AET Connect est l'annuaire panafricain des Anciens Enfants de Troupe : un réseau fermé que l'on rejoint sur l'invitation d'un collègue de sa promotion. Il permet de rejoindre sa promo, de retrouver et de joindre d'autres AET tout en gardant la main sur ce que l'on montre de soi.

Le succès : un ancien qui s'inscrit retrouve des membres de sa promo, et un membre qui cherche quelqu'un dans une ville ou un pays le trouve et peut le joindre.

## Positioning

Ce que ni un groupe WhatsApp ni LinkedIn ne peuvent revendiquer : **la confiance par la promo**. Chaque membre a été invité par un collègue de sa propre promotion (ou validé par un administrateur pour le premier de sa promo), via un code d'invitation à usage unique et limité dans le temps. L'annuaire ne contient donc que d'authentiques anciens, rangés par école et par promo, et chacun décide de ce qu'il rend visible.

## Operating Context

- **Entrée dans le réseau**, trois parcours : code reçu d'un ancien (lien partagé par WhatsApp, SMS ou email) ; demande de code quand la promo a déjà des membres (transmise aux administrateurs, qui envoient un code) ; demande d'accès validée par un administrateur quand la promo n'a encore aucun membre.
- **Ambassadeurs** : membres qui portent leur promo et disposent de 15 invitations (3 pour un membre, illimité pour un admin). Un code non utilisé expire au bout de 30 jours ou peut être révoqué, et rend alors sa place.
- **Annuaire** : recherche par nom (sans accents), filtres par école, promo, pays de l'école et ville ; profils dont l'email et le téléphone ne sont visibles que si le membre l'a choisi ; un membre peut se retirer entièrement de l'annuaire.
- **Administration** : validation des demandes d'accès (avec le message d'invitation à transmettre), demandes de suppression de compte, gestion des écoles et des membres (rôles, ambassadeurs).
- **Envoi d'emails** : pas encore de domaine d'envoi ; l'admin transmet lui-même le message d'invitation (copier-coller). Le partage entre membres passe par WhatsApp, SMS ou lien.

## Capabilities and Constraints

- Application web Next.js 16 (React 19, Tailwind CSS 4, composants shadcn/Radix) + API Express + Supabase (Auth, Postgres, Storage pour les avatars). Déploiement Vercel (frontend) et Railway (API).
- Interface **en français**. Réseau sur invitation : aucune inscription publique ; annuaire et profils réservés aux membres connectés.
- Termes du domaine à employer tels quels : AET, ancien, promo, école, ambassadeur, code d'invitation, demande d'accès, annuaire.
- L'invitation vient d'un **collègue de promotion** (les membres d'une même promo s'invitent entre eux), pas « d'un ancien » en général : « Un collègue de promotion vous a envoyé un code ». « Ancien » seul désigne un aîné dans la hiérarchie de l'école (l'élève de 5ᵉ est l'ancien de celui de 6ᵉ ; le terminal est l'ancien de tous) ; il n'est devenu un nom qu'à la sortie de l'école, dans « Ancien Enfant de Troupe ». Pour les membres, on écrit donc **AET** ou **Anciens Enfants de Troupe** ; pour des pairs, **collègues de promotion**. Jamais « les anciens » pour parler des membres en général.
- **Décisions ouvertes** :
  - appareils et contexte d'usage réels des membres (mobile ou ordinateur, connexions en Afrique ou dans la diaspora) : inconnus à ce jour ;
  - **événements** : l'API existe (création, inscription) mais aucun écran ne l'expose ; leur place dans le produit n'est pas décidée ;
  - envoi automatique des emails (en attente d'un domaine d'envoi).

## Brand Commitments

- Nom : **AET Connect** ; sous-titre en usage : « Annuaire panafricain des Anciens Enfants de Troupe ».
- **Voix** : vouvoiement chaleureux, on parle entre anciens, proche et fraternel, sans raideur administrative.
- AET Connect est soutenu par une association d'anciens, qui **ne doit pas être nommée** sur le site pour l'instant (ni nom, ni logo).
- Aucune charte graphique, aucun logo imposés : le badge texte « AET » actuel n'est pas un engagement.

## Evidence on Hand

- Les 9 écoles réelles (nom, ville, pays, année de création, sigle, drapeau) sont en base (`supabase/seed.sql` pour la copie locale).
- **Aucune photo de l'association** pour l'instant (anciens, promos, écoles). Le site s'appuie sur de **vraies photos** : l'univers militaire est voulu (soldats, officiers et hiérarchie, cérémonies, entraînement, entraide entre soldats), ainsi que la communauté et l'annuaire numérique.
  - **Photos de remplacement** sous licence libre (Wikimedia Commons : domaine public ou CC), de soldats et d'officiers des pays des écoles, en noir et blanc. Elles ne sont jamais légendées ni présentées comme des membres d'AET Connect ; leurs crédits figurent en pied de page. Elles seront remplacées par les photos de l'association.
  - **Images générées** acceptées pour ce que les photos libres ne montrent pas (salle de classe, transmission entre un ancien et un jeune, retrouvailles de promo), sans jamais passer pour de vrais anciens ni représenter de façon réaliste une école précise.
  - **Adultes seulement** : aucune photo de mineurs, y compris des cadets en défilé public. L'enfance passera par des images générées ou par des photos de l'association avec consentement.
  - Ni emblèmes de haine ou de suprématie, ni scène de combat ou d'arme pointée : l'armée se montre par la cérémonie, la discipline, l'entraînement et l'entraide.
- Aucun témoignage, chiffre public, presse ou partenaire à afficher : ne pas en inventer. Les nombres de membres affichés doivent venir de la base.

## Product Principles

1. **La promo d'abord** : l'école et l'année d'entrée sont l'identité d'un membre et le premier repère de navigation.
2. **La confiance se voit** : on comprend toujours qui vous a fait entrer et pourquoi le réseau est sûr ; un code, une invitation, un parrain.
3. **Chacun garde la main sur sa visibilité** : ce qu'un membre cache ne doit jamais fuiter, ni à l'écran ni par un filtre.
4. **Entrer doit être simple** : chaque parcours d'inscription dit où l'on en est et ce qui vient ensuite.
5. **Fonctionner partout** : tant que les appareils et les connexions des membres sont inconnus, chaque écran doit rester utilisable sur téléphone et avec une connexion modeste.

## Accessibility & Inclusion

Cible WCAG 2.1 AA (l'audit du 9 novembre 2026 relève le contraste du texte secondaire et les boutons-icônes sans nom comme écarts à corriger). Public adulte de tous âges : tailles de texte et cibles tactiles confortables. Noms propres et lieux africains accentués à respecter (recherche sans accents déjà en place).
