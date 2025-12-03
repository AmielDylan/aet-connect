# 🎓 AET Connect

**Annuaire panafricain des Anciens Enfants de Troupe**

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Tests](https://img.shields.io/badge/tests-139%2F139-success)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📁 Structure du projet

```
AET-Connect/
├── README.md                    # Ce fichier
├── documentation/               # Documentation complète du projet
│   ├── ARCHITECTURE.md         # Architecture système
│   ├── TESTING.md              # Guide des tests
│   ├── backend/                # Documentation backend
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
- **[backend/](./documentation/backend/)** - Documentation API backend
- **[frontend/](./documentation/frontend/)** - Documentation frontend
- **[scripts/](./documentation/scripts/)** - Documentation des scripts utilitaires

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

# Suite complète de tests workflows
npx tsx tests/run-all-tests.ts
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

# Rapports
npm run report:registration       # Rapport module Registration
npm run report:auth              # Rapport module Auth
npm run report:events            # Rapport module Events
```

Voir [`documentation/scripts/`](./documentation/scripts/) pour la liste complète.

---

## 🏗️ Architecture

### Backend

- **Framework** : Express.js
- **Base de données** : Supabase (PostgreSQL)
- **Authentification** : JWT (Access + Refresh tokens)
- **Validation** : Zod
- **Logging** : Winston

**Modules API :**
- `/api/register` - Inscription (5 endpoints)
- `/api/auth` - Authentification (4 endpoints)
- `/api/codes` - Codes d'invitation (2 endpoints)
- `/api/events` - Événements (7 endpoints)
- `/api/admin` - Administration (10+ endpoints)
- `/api/schools` - Écoles (2 endpoints)
- `/api/users` - Utilisateurs (3 endpoints)

### Frontend

- **Framework** : Next.js 16 (App Router)
- **UI** : React 19 + Tailwind CSS + Shadcn/ui
- **State Management** : React Query + Zustand
- **Validation** : Zod + React Hook Form

**Workflows d'inscription :**
- Inscription avec code d'invitation
- Demande d'accès initial (premier membre)
- Demande code entre pairs

---

## 🔐 Sécurité

- **Helmet** : Headers de sécurité HTTP
- **CORS** : Configuration CORS
- **JWT** : Tokens signés avec expiration
- **Bcrypt** : Hashage des mots de passe
- **Validation** : Zod pour validation des données

---

## 📊 Statistiques

- **40+ endpoints** REST
- **139 tests E2E** (100% coverage)
- **7 modules** complets
- **Production ready**

---

## 🔗 Liens utiles

- [Documentation complète](./documentation/)
- [Architecture système](./documentation/ARCHITECTURE.md)
- [Guide des tests](./documentation/TESTING.md)

---

## 👨‍💻 Développeur

**Amiel ADJOVI (AmielDylan)**

---

## 📝 License

MIT License - Copyright (c) 2025 AET Connect
