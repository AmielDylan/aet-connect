# Reprise : refonte « Esprit de corps » d’AET Connect

Point d’étape au 12 novembre 2026, pour reprendre la refonte dans une nouvelle conversation.
À lire avec [PRODUCT.md](../PRODUCT.md) (le produit, le vocabulaire, la politique d’images) et [frontend/DESIGN.md](../frontend/DESIGN.md) (le système visuel et chaque composant).

## Où on en est

| Écran | Proposition retenue | En ligne |
|---|---|---|
| Accueil `/` | « Esprit de corps » : hero et mosaïque photo, bandeau des écoles avec drapeaux, trois façons de rejoindre (images générées), formulaire, grand pied de page | oui (PR #4, #7, #8) |
| Connexion `/login` | A « Le portrait » : formulaire, diaporama de 4 photos avec légendes, badge « AET un jour, AET toujours » | oui (PR #4) |
| Mot de passe oublié / nouveau | B « L’étoffe » : carte centrée, calme, sans photo | oui (PR #5) |
| Inscription `/register` et ses 3 parcours | C « La photo de promo » : photo à gauche, parcours à droite, « Étape 2/3 · titre » | oui (PR #6) |
| Espace membre : en-tête, pied, accueil `/dashboard` | B « La photo de promo » : navigation en haut, recherche (⌘K, menu mobile), bandeau vert, trombinoscope | oui (PR #7) |
| Icône du site, image de partage (OG) | le soleil ; le hero avec le titre et le badge | oui (PR #8) |
| Annuaire `/dashboard/directory` | C « La recherche » : bandeau vert « Retrouver un AET », grand champ (nom ou promo), raccourcis Ma promo / Mon école / Ma ville, filtres, fiches, « Voir plus d’AET » | oui (PR #10) |
| Profil d’un membre `/profile/[id]` | B « Le bandeau » : bandeau à hauteur fixe (c’est le portrait qui la donne), en quelques mots, sa promo, coordonnées (seules celles que le membre montre) ; le profil est dans le cadre de l’espace membre | oui (PR #11) |
| Mon profil `/dashboard/profile` | B « Le bandeau » : le bandeau du profil d’un membre avec la photo à changer sur place, vos informations, ce que voient les AET (dont « Apparaître dans l’annuaire »), mot de passe, départ | oui (PR #12) |
| Écoles `/dashboard/schools` | A « Les cartes » : bandeau vert avec trois chiffres et la cérémonie, une carte par école (la vôtre en premier), « N membres » et « Voir » vers l’annuaire | oui (PR #12) |
| Administration, vue d’ensemble `/dashboard/admin` | B « Les chiffres » : quatre chiffres en tuiles blanches (sans cercle), panneau vert des membres par école (barres d’or) et par rôle, demandes d’accès en attente | `develop` |
| Administration, demandes d’accès `/dashboard/admin/pending` | B « Le tri » : liste à gauche, demande choisie à droite, décision sur place ; l’option ambassadeur n’apparaît que si la promo n’en a pas (sinon, qui la représente) | `develop` |
| Mes codes `/dashboard/codes` | B « Le bandeau » : bandeau vert avec l’officier (la bulle porte le dernier code), codes en attente à partager ou révoquer, « Ils ont rejoint grâce à vous » | oui (PR #9) |

**Reste à refaire**, dans le nouvel en-tête mais encore dans l’ancien style gris :
1. Administration : `users` (349), `schools` (388), `deletions` (337). Briques communes dans `components/espace/administration.tsx` (`Filtres`, `ChoixAmbassadeur`, `MessageATransmettre`).

## Comment on travaille

- **Trois propositions par page**, rendues sur le serveur local (port 3100) et ouvertes dans le navigateur **avant** de demander un choix. Maquettes dans `frontend/app/maquettes/…`, supprimées après intégration.
- Skills : refero-design pour l’inspiration (MCP Refero non connecté : références intégrées), impeccable contre les tics d’IA, design-taste-frontend pour les images, design:ux-copy pour le ton.
- **Git** : branche `feature/…` depuis `develop`, `merge --no-ff` dans `develop`, PR `develop → main`, puis retour sur `develop` (synchronisé sur `main`).
- **Déploiement uniquement sur le « go » explicite** de la personne. Vercel (frontend) et Railway (backend) déploient depuis `main`. Production : https://aet-connect.vercel.app

## Règles de design à respecter partout

- Polices : titres **Unbounded**, texte **Figtree** (`lib/fonts.ts`, classes `font-titre` / `font-texte`, conteneur `${espritFonts} esprit font-texte`).
- Couleurs : vert `#1D3B2A`, crème `#F4EEE2`, sable, encre, olive. **Accent selon le fond** : or `#FFC000` sur vert, terre `#8B4A1E` sur crème. Le cœur du soleil est toujours terre.
- Boutons pleins vert ou crème ; jamais d’or dans un bouton, jamais de bouton en contour. Pas de cartes vertes sur fond vert.
- Liens : couleur du texte au repos ; au survol, l’accent avec une flèche (`LienFleche`, option `visible` quand le lien est aligné sur un bord) ou un soulignement. Jamais de soulignement au repos.
- Pas de surtitres, pas de filets à l’intérieur des sections, pas de numéros dans des cercles (étapes : « Étape 2/3 · titre »).
- Une bulle dessinée sur une image (`photo.bulle`) reçoit son texte dans `PhotoFrame` : elle fait partie de l’image (même filtre, même zoom, taille en unités cqw) et le cadre garde les proportions de la photo.
- Coins exagérés concentriques à leur conteneur (bandeau 76px, photo 64px avec 12px de marge).
- Menu burger sur mobile. Cibles de 44px minimum. Mouvement réduit respecté.
- **Images** : de vraies photos en noir et blanc (la couleur revient au survol), adultes seulement, ni armes pointées ni combat, ni symboles haineux. **L’esprit militaire rassemble les AET** : garder l’univers de l’école militaire, avec noblesse et simplicité, sans images disparates. Les photos d’illustration ne sont jamais présentées comme des membres (crédits dans le pied de page de l’accueil).
- **Vocabulaire** : « rejoindre » (jamais « entrer ») ; on est invité par un « collègue de promotion » ; « ancien » seul désigne un aîné hiérarchique, les membres sont des « AET ». Voix chaleureuse et non directive : indicatif et « vous pouvez », impératif réservé aux boutons, erreurs « Il manque… ».

## Lancer, tester, déployer

```sh
# Base locale (OrbStack doit tourner)
open -a OrbStack && npx supabase start
docker restart supabase_kong_aet-connect   # si l'API renvoie « upstream » ou « Utilisateur non trouvé »

# Backend (port 3001)
cd backend && doppler run -c dev_backend -- env FRONTEND_URL=http://localhost:3100 npx tsx src/app.ts

# Frontend (port 3100, jamais 3000 : pris par un autre projet)
cd frontend && doppler run -p aet-connect -c dev_frontend -- env -u NODE_ENV npx next build
doppler run -p aet-connect -c dev_frontend -- env -u NODE_ENV npx next start -p 3100

# Tests de bout en bout (Playwright, Chrome installé, Mailpit pour les emails)
cd frontend && doppler run -c dev_backend -- env -u NODE_ENV npx playwright test

# Déploiement (après le « go »)
git push origin develop
gh pr create --base main --head develop
gh pr checks <n> --watch && gh pr merge <n> --merge
git checkout main && git merge --ff-only origin/main && git checkout develop && git merge --ff-only origin/main && git push origin develop
```

## Points ouverts

- La recherche de l’annuaire ne porte que sur les noms (colonne `search_text` de la vue `directory_entries`) ; une année devient le filtre de promo. Chercher aussi l’école et la ville demanderait une migration de la vue (base de production : accord nécessaire).
- Le filtre « Pays » de l’annuaire porte sur le pays de l’école (`school_country`), pas sur le pays de résidence.
- En local, l’API perd parfois sa connexion à la base (`fetch failed`). Depuis le correctif du middleware d’authentification, une panne de la base répond 503 (réessayé) et non plus 401 (qui renvoyait à la connexion). Redémarrer l’API (port 3001) après tout redémarrage de `supabase_kong`.

- Pas de limite de débit sur les routes publiques de demande (code, accès).
- À vérifier dans Supabase (production) : Authentication → URL Configuration doit contenir `https://aet-connect.vercel.app/reset-password`.
- Décidé le 12 novembre : le changement de mot de passe suit les règles de l’inscription (tout caractère permis), et la promo se voit toujours (migration `20261112000000_promo_toujours_visible.sql` : contrainte `show_entry_year` toujours vrai, la vue `directory_entries` ne la lit plus).
- Le test e2e « profil d’un membre masqué en moins de 2 secondes » peut échouer juste après un redémarrage de l’API.
- En local, la base compte des centaines d’écoles créées par les tests (une par membre). `GET /api/schools` calculait les statistiques école par école (4 requêtes chacune) et saturait la connexion locale ; elles sont désormais comptées en trois requêtes.
- Décidé le 12 novembre : **un seul ambassadeur par promo** (migration `20261112100000_un_ambassadeur_par_promo.sql`, index unique). L’API refuse (409) de nommer un second ambassadeur, et d’accepter une demande « ambassadeur » si la promo en a déjà un ou si un code d’ambassadeur pour elle attend d’être utilisé ; un tel code utilisé malgré tout crée le compte sans le statut. Chaque demande d’accès porte `promo_ambassador` (l’ambassadeur actuel, ou null). La migration s’arrête si une promo en compte déjà plusieurs : vérifier la production avant de l’appliquer.
- Les statistiques de l’administration (`GET /api/admin/stats`) ne comptaient par rôle et par école que les 1 000 premiers membres (limite de lignes de l’API de la base) ; elles lisent désormais toute la table par lots (`backend/src/utils/pages.ts`). Les graphiques Recharts ont été retirés.
- En local, les toutes premières requêtes d’un compte tout juste créé peuvent renvoyer 401 ; React Query réessaie.
- Dette de lint dans les pages pas encore refaites (`any`, apostrophes), hors des fichiers de la refonte.
- Les boutons `mailto:admin@aetconnect.com` ont été retirés : domaine non vérifié.
- Réactiver les synchronisations Vercel du projet sendbox dans Doppler (côté personne).

## Contraintes de sécurité

Ne jamais afficher de secret (Doppler, trousseau), ne jamais committer de `.env`, ne pas toucher au projet sendbox ni au port 3000, ne pas toucher aux comptes des autres administrateurs, pas de changement de base de production ni de merge sur `main` sans accord.
