# 🎓 AET Connect

**Annuaire panafricain des Anciens Enfants de Troupe**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📁 Structure du projet

```
AET-Connect/
├── README.md                    # Ce fichier
├── documentation/               # Documentation complète du projet
│   ├── ARCHITECTURE.md         # Architecture système
│   ├── TESTING.md              # Guide des tests
│   ├── backend/                # Documentation backend (GitBook)
│   ├── frontend/               # Documentation frontend
│   └── scripts/                # Documentation scripts
├── backend/                    # API REST (Node.js + Express + TypeScript)
│   ├── src/                    # Code source
│   ├── scripts/                # Scripts utilitaires
│   ├── tests/                  # Tests backend
│   └── package.json
└── frontend/                   # Application web (Next.js 16)
    ├── app/                    # Pages Next.js
    ├── components/             # Composants React
    ├── lib/                    # Utilitaires
    ├── tests/                  # Tests frontend
    └── package.json
```

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js 20+
- Docker (pour la base Supabase locale)
- [Supabase CLI](https://supabase.com/docs/guides/cli) et [Doppler CLI](https://docs.doppler.com/docs/install-cli), connectés à leurs comptes (`supabase login`, `doppler login`)

### Variables d'environnement : Doppler

Aucun fichier `.env` : toutes les variables viennent du projet Doppler `aet-connect`.

| Config | Usage |
|---|---|
| `dev` → `dev_backend`, `dev_frontend` | Développement local, base Supabase locale |
| `prd` → `prd_backend` | Production backend, synchronisée vers Railway |
| `prd` → `prd_frontend` | Production frontend, synchronisée vers Vercel |
| `prd_ops` | Mot de passe Postgres, pour les commandes `supabase db …` |

Les branches héritent des valeurs communes de leur racine (URL Supabase, clé anon). Une seule fois, à la racine du dépôt :

```bash
doppler setup --no-interactive   # lit doppler.yaml : backend/ → dev_backend, frontend/ → dev_frontend
```

### Base de données locale

```bash
supabase start      # démarre Supabase en local et applique supabase/migrations + supabase/seed.sql
supabase db reset && docker restart supabase_kong_aet-connect   # repart d'une base propre (Kong garde sinon l'ancienne adresse d'Auth : erreurs 502)
```

Le seed contient les 9 écoles réelles et des membres **fictifs** (mot de passe `Motdepasse123!`) :
`admin@aetconnect.test`, `ambassadeur@aetconnect.test`, `alumni.pmb@aetconnect.test`, `alumni.cachee@aetconnect.test`,
ainsi que des codes d'invitation dans tous les états (`AET-NEUF-2345` neuf, `AET-UTIL-2345` utilisé, `AET-EXPR-2345` expiré, `AET-REVQ-2345` révoqué, `AET-TOUS-2345` universel).

### Lancer les applis

```bash
cd backend && npm install && npm run dev     # http://localhost:3001 (doppler run inclus)
cd frontend && npm install && npm run dev    # http://localhost:3000 (doppler run inclus)
```

### Modifier le schéma

Toujours par migration, jamais par script :

```bash
supabase migration new <nom>                                          # écrire le SQL
supabase db reset                                                     # tester en local
doppler run -c prd_ops -- sh -c 'supabase db push --db-url "$SUPABASE_DB_URL"'   # appliquer en production
```

Les commandes vers la prod passent par `SUPABASE_DB_URL` (config `prd_ops`) : elles ne dépendent d'aucun compte Supabase connecté au CLI.

---

## 📚 Documentation

Toute la documentation est disponible dans le dossier [`documentation/`](./documentation/) :

- **[ARCHITECTURE.md](./documentation/ARCHITECTURE.md)** - Architecture complète du système
- **[TESTING.md](./documentation/TESTING.md)** - Guide des tests
- **[backend/](./documentation/backend/)** - Documentation API backend (GitBook)
- **[frontend/](./documentation/frontend/)** - Documentation frontend
- **[scripts/](./documentation/scripts/)** - Documentation des scripts utilitaires

> 📖 **Documentation en ligne** : [https://amieldylan.github.io/AET-Connect/](https://amieldylan.github.io/AET-Connect/)

---

## 🏗️ Architecture

### Backend

- **Framework** : Express.js
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : Supabase Auth (JWT)
- **Validation** : Zod
- **Logging** : Winston

**Modules API :**
- `/api/register` - Inscription (5 endpoints)
- `/api/auth` - Authentification (4 endpoints)
- `/api/codes` - Codes d'invitation (4 endpoints)
- `/api/events` - Événements (7 endpoints)
- `/api/admin` - Administration (15+ endpoints)
- `/api/schools` - Écoles (2 endpoints)
- `/api/users` - Utilisateurs (6 endpoints)

### Frontend

- **Framework** : Next.js 16 (App Router)
- **UI** : React 19 + Tailwind CSS + Shadcn/ui
- **State Management** : React Query + Zustand
- **Validation** : Zod + React Hook Form
- **Authentification** : Supabase Auth (SSR)

**Pages principales :**
- `/` - Page d'accueil
- `/login` - Connexion
- `/register` - Inscription (3 workflows)
- `/dashboard` - Tableau de bord
- `/dashboard/directory` - Annuaire des membres
- `/dashboard/codes` - Gestion des codes d'invitation
- `/dashboard/profile` - Profil utilisateur
- `/dashboard/admin` - Administration (admin uniquement)
- `/profile/[id]` - Profil public

---

## ✨ Fonctionnalités principales

### Inscription & Authentification
- ✅ Inscription avec code d'invitation
- ✅ Demande d'accès initial (premier membre d'une école/promo)
- ✅ Demande de code entre pairs
- ✅ Authentification Supabase (JWT)
- ✅ Gestion des rôles (Alumni, Modérateur, Admin)
- ✅ Système d'ambassadeurs

### Gestion des codes
- ✅ Génération de codes d'invitation
- ✅ Limites par rôle (Alumni: 3, Ambassadeur: 15, Admin: illimité)
- ✅ Historique des codes utilisés
- ✅ Partage de codes (email, WhatsApp, SMS)

### Annuaire
- ✅ Recherche par nom, école, promotion, pays
- ✅ Filtres avancés (école, promotion, pays, ambassadeur)
- ✅ Vue liste et carte
- ✅ Profils publics avec paramètres de confidentialité

### Administration
- ✅ Dashboard avec statistiques
- ✅ Gestion des utilisateurs (rôles, ambassadeurs)
- ✅ Gestion des écoles
- ✅ Validation des demandes d'accès
- ✅ Graphiques et rapports

### Profil utilisateur
- ✅ Édition du profil
- ✅ Paramètres de confidentialité
- ✅ Changement de mot de passe
- ✅ Avatar (à venir)

---

## 🔐 Sécurité

- **Supabase Auth** : Authentification sécurisée avec JWT
- **Helmet** : Headers de sécurité HTTP
- **CORS** : Configuration CORS stricte
- **Validation** : Zod pour validation des données
- **RLS** : Row Level Security sur Supabase
- **Middleware** : Protection des routes admin

---

## 📊 Statistiques

- **40+ endpoints** REST
- **7 modules** complets
- **Production ready**
- **Documentation complète** (GitBook)

---

## 🧪 Tests

### Backend

Les tests tournent **uniquement contre la base locale** : `tests/assert-local.ts` refuse de démarrer si l'URL Supabase n'est pas `localhost`. Il faut lancer `supabase start` et le backend (`npm run dev`) avant.

```bash
cd backend

# Tous les tests (Doppler injecte la config dev_backend)
doppler run -- npm test

# Tests Vitest seuls (modules et routes, sur la base locale), ou en continu
doppler run -- npm run test:unit
doppler run -- npm run test:watch
```

### Frontend

Parcours de bout en bout avec Playwright, dans ton Chrome installé, sur la pile locale
(`supabase start` ; le backend et le frontend sont démarrés par Playwright sur les ports 3001 et 3100) :

```bash
cd frontend
npm run test:e2e      # Doppler fournit la config dev_backend ; refuse de tourner hors base locale
npm run lint
```

---

## 📦 Scripts utilitaires

```bash
cd backend
doppler run -- npm run db:test                    # tester la connexion à la base locale
doppler run -c prd_backend -- npm run db:test     # … ou à la production
```

Les données de test viennent du seed (`supabase/seed.sql`), les codes d'invitation de l'écran admin
(code universel compris), et le schéma des migrations : aucun script n'écrit directement dans la base.

---

## 🔗 Liens utiles

- [Documentation complète](./documentation/)
- [Architecture système](./documentation/ARCHITECTURE.md)
- [Guide des tests](./documentation/TESTING.md)
- [Documentation API (GitBook)](https://amieldylan.github.io/AET-Connect/)

---

## 👨‍💻 Développeur

**Amiel ADJOVI (AmielDylan)**

---

## 📝 License

MIT License - Copyright (c) 2025 AET Connect
