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
supabase db reset   # repart d'une base propre
```

Le seed contient les 9 écoles réelles et des membres **fictifs** (mot de passe `Motdepasse123!`) :
`admin@aetconnect.test`, `ambassadeur@aetconnect.test`, `alumni.pmb@aetconnect.test`, `alumni.cachee@aetconnect.test`,
ainsi que des codes d'invitation dans tous les états (`USER-NEUF05`, `USER-UTIL05`, `USER-EXPI05`, `USER-REVO05`, `ADMIN-TOUS`).

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
doppler run -c prd_ops -- supabase db push --linked                   # appliquer en production
```

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

# Tous les tests E2E (Doppler injecte la config dev_backend)
doppler run -- npm test

# Tests par module
npm run test:e2e:registration
npm run test:e2e:auth
npm run test:e2e:events
npm run test:e2e:admin
```

### Frontend

```bash
cd frontend

# Tests API
npm run test:api

# Linter
npm run lint
```

---

## 📦 Scripts utilitaires

### Backend

```bash
cd backend

# En local (config dev_backend par défaut)
doppler run -- npm run admin:create-code     # Créer un code admin universel
doppler run -- npm run admin:list-codes      # Lister les codes admin

# Contre la production : choisir la config explicitement
doppler run -c prd_backend -- npm run admin:list-codes
```

Le schéma ne se modifie plus par script : voir « Modifier le schéma » plus haut.

Voir [`documentation/scripts/`](./documentation/scripts/) pour la liste complète.

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
