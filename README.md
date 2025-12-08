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
- npm ou yarn
- Compte Supabase (pour la base de données)

### Backend

```bash
cd backend
npm install
cp .env.example .env.local  # Configurer les variables d'environnement
npm run dev                 # Démarrer en mode développement
```

**Backend disponible sur :** http://localhost:3001

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # Configurer NEXT_PUBLIC_API_URL
npm run dev                 # Démarrer en mode développement
```

**Frontend disponible sur :** http://localhost:3000

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

```bash
cd backend

# Tous les tests E2E
npm test

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

# Setup
npm run setup:test-users          # Créer utilisateurs de test
npm run admin:create-code         # Créer code admin universel

# Migrations DB
npm run migrate:entry-year        # Migration format entry_year
npm run db:add-max-codes          # Ajouter colonne max_codes
npm run db:create-events         # Créer tables événements
npm run db:add-user-privacy       # Ajouter privacy settings
```

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
