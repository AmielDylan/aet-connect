# 🏗️ Architecture AET Connect

## 📋 Vue d'ensemble

AET Connect est une application full-stack pour l'annuaire panafricain des Anciens Enfants de Troupe, construite avec :
- **Backend** : Node.js + Express + TypeScript + Supabase
- **Frontend** : Next.js 16 + React 19 + TypeScript + Tailwind CSS

---

## 📁 Structure du projet

```
AET Connect/
├── backend/              # API REST Node.js/Express
│   ├── src/
│   │   ├── app.ts       # Point d'entrée principal
│   │   ├── config/      # Configuration (DB, env)
│   │   ├── controllers/ # Contrôleurs API
│   │   ├── services/    # Logique métier
│   │   ├── models/      # Types TypeScript
│   │   ├── routes/      # Routes Express
│   │   ├── middleware/  # Middlewares (auth, error, logger)
│   │   └── utils/       # Utilitaires (JWT, logger, validations)
│   ├── tests/           # Tests (e2e, integration, unit)
│   ├── scripts/          # Scripts utilitaires (migrations, setup)
│   └── package.json
│
├── frontend/             # Application Next.js
│   ├── app/              # App Router Next.js
│   │   ├── (auth)/       # Routes authentifiées
│   │   ├── register/     # Workflows d'inscription
│   │   └── page.tsx      # Pages publiques
│   ├── components/       # Composants React réutilisables
│   │   ├── ui/           # Composants Shadcn/ui
│   │   └── registration/ # Composants spécifiques inscription
│   ├── lib/              # Utilitaires frontend (API client)
│   ├── types/            # Types TypeScript partagés
│   └── package.json
│
└── docs/                 # Documentation (GitBook)

```

---

## 🔧 Backend Architecture

### **Point d'entrée** : `src/app.ts`

```typescript
// Configuration Express
app.use(helmet())           // Sécurité
app.use(cors())             // CORS
app.use(express.json())     // Parsing JSON
app.use(requestLogger)      // Logging

// Routes API
app.use('/api/register', registrationRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/codes', codesRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/schools', schoolsRoutes)
app.use('/api/users', usersRoutes)

// Middlewares de fin
app.use(notFoundHandler)   // 404
app.use(errorHandler)      // Gestion erreurs
```

### **Modules principaux**

#### 1. **Registration** (`/api/register`)
- `POST /check-school-promo` - Vérifier existence promotion
- `POST /request-initial-access` - Demande accès initial (premier membre)
- `POST /verify-invitation-code` - Vérifier code d'invitation
- `POST /complete-registration` - Finaliser inscription
- `POST /request-code-from-peer` - Demander code à un pair

#### 2. **Auth** (`/api/auth`)
- `POST /login` - Connexion (email + password)
- `POST /logout` - Déconnexion
- `POST /refresh` - Rafraîchir token
- `GET /me` - Profil utilisateur actuel

#### 3. **Codes** (`/api/codes`)
- `POST /generate` - Générer code d'invitation
- `GET /my-codes` - Mes codes générés

#### 4. **Events** (`/api/events`)
- `POST /` - Créer événement
- `GET /` - Liste événements
- `GET /:id` - Détails événement
- `PATCH /:id` - Modifier événement
- `DELETE /:id` - Supprimer événement
- `POST /:id/register` - S'inscrire
- `DELETE /:id/unregister` - Se désinscrire

#### 5. **Schools** (`/api/schools`)
- `GET /` - Liste écoles
- `GET /:id` - Détails école

#### 6. **Users** (`/api/users`)
- `GET /` - Liste utilisateurs
- `GET /:id` - Profil utilisateur
- `PATCH /:id` - Modifier profil

#### 7. **Admin** (`/api/admin`)
- `GET /stats` - Statistiques
- `GET /access-requests` - Demandes d'accès
- `PATCH /access-requests/:id` - Valider/Refuser demande

### **Base de données** (Supabase PostgreSQL)

**Tables principales :**
- `users` - Utilisateurs
- `schools` - Écoles
- `invitation_codes` - Codes d'invitation
- `access_requests` - Demandes d'accès initial
- `code_requests` - Demandes de code entre pairs
- `events` - Événements
- `event_registrations` - Inscriptions événements

**Relations clés :**
- `users.school_id` → `schools.id`
- `invitation_codes.school_id` → `schools.id`
- `access_requests.school_id` → `schools.id`
- `events.created_by` → `users.id`

### **Authentification**

- **JWT** : Access token (15 min) + Refresh token (7 jours)
- **Middleware** : `auth.middleware.ts` vérifie le token sur routes protégées
- **Rôles** : `member`, `ambassador`, `admin`

---

## 🎨 Frontend Architecture

### **Routing** (Next.js App Router)

```
app/
├── (auth)/              # Groupe de routes authentifiées
│   └── login/           # Page de connexion
│
├── register/            # Workflows d'inscription
│   ├── page.tsx         # Choix du workflow
│   ├── with-code/       # Inscription avec code
│   ├── request-access/  # Demande accès initial
│   └── request-code/    # Demande code peer
│
└── page.tsx             # Page d'accueil (à venir)
```

### **Composants principaux**

#### **Registration Components**
- `SchoolYearSelector` - Sélection école + année avec validation dynamique
- `FormField` - Champ de formulaire réutilisable
- `RegistrationSteps` - Indicateur d'étapes

#### **UI Components** (Shadcn/ui)
- `Button`, `Card`, `Input`, `Select`, `Alert`, `Tooltip`, etc.

### **State Management**

- **React Query** (`@tanstack/react-query`) : Gestion des données serveur
- **React State** : État local des formulaires
- **Zustand** (optionnel) : État global si nécessaire

### **API Client** (`lib/api.ts`)

```typescript
// Client API centralisé
export const apiClient = {
  // Registration
  checkSchoolPromo,
  requestInitialAccess,
  verifyInvitationCode,
  completeRegistration,
  requestCodeFromPeer,
  
  // Auth
  login,
  logout,
  refreshToken,
  getMe,
  
  // Schools
  getSchools,
  
  // Events, Codes, Admin...
}
```

---

## 🧪 Tests

### **Backend Tests** (`backend/tests/`)

#### **Structure**
```
tests/
├── e2e/                 # Tests end-to-end
│   ├── registration/    # Tests workflows inscription
│   ├── auth/            # Tests authentification
│   ├── events/          # Tests événements
│   ├── admin/           # Tests admin
│   ├── schools/         # Tests écoles
│   └── users/           # Tests utilisateurs
│
├── integration/         # Tests d'intégration
│   └── services/
│
├── unit/                 # Tests unitaires
│   ├── utils/
│   └── validators/
│
├── seed-test-data.ts     # Créer données de test
├── test-workflow-*.ts   # Tests workflows spécifiques
├── verify-test-results.ts # Vérifier résultats
└── run-all-tests.ts     # Orchestrateur principal
```

#### **Exécution**
```bash
# Tous les tests
cd backend
npx tsx tests/run-all-tests.ts

# Tests spécifiques
npm run test:e2e:registration
npm run test:e2e:auth
npm run test:e2e:events
```

### **Frontend Tests**

- Pas encore implémentés (à venir)

---

## 🚀 Scripts Utilitaires

### **Backend Scripts** (`backend/scripts/`)

#### **Setup & Données**
- `setup-test-users.ts` - Créer utilisateurs de test
- `get-real-test-data.ts` - Récupérer données depuis DB
- `create-admin-universal-code.ts` - Créer code admin universel

#### **Migrations DB**
- `add-max-codes-column.ts` - Ajouter colonne max_codes_allowed
- `add-events-fields.ts` - Ajouter champs événements
- `add-user-privacy.ts` - Ajouter champs privacy utilisateur
- `add-user-profile-columns.ts` - Ajouter colonnes profil
- `create-events-tables.ts` - Créer tables événements
- `migrate-entry-year.ts` - Migration format entry_year

#### **Rapports**
- `generate-test-report.ts` - Rapport module Registration
- `generate-auth-report.ts` - Rapport module Auth
- `generate-events-report.ts` - Rapport module Events
- `generate-admin-report.ts` - Rapport module Admin
- `generate-v1-report.ts` - Rapport API v1
- `generate-gitbook-from-reports.ts` - Convertir en GitBook

#### **Commandes**
```bash
# Setup
npm run setup:test-users
npm run admin:create-code

# DB
npm run db:test
npm run db:add-max-codes
npm run migrate:entry-year

# Rapports
npm run report:registration
npm run report:auth
npm run report:events
```

---

## 🔐 Sécurité

- **Helmet** : Headers de sécurité HTTP
- **CORS** : Configuration CORS pour développement/production
- **JWT** : Tokens signés avec expiration
- **Bcrypt** : Hashage des mots de passe
- **Validation** : Zod pour validation des données
- **Rate Limiting** : (À implémenter)

---

## 📦 Dépendances principales

### **Backend**
- `express` - Framework web
- `@supabase/supabase-js` - Client Supabase
- `jsonwebtoken` - JWT
- `bcrypt` - Hashage mots de passe
- `zod` - Validation
- `winston` - Logging
- `tsx` - TypeScript execution

### **Frontend**
- `next` - Framework React
- `react` / `react-dom` - React
- `@tanstack/react-query` - Data fetching
- `tailwindcss` - CSS framework
- `lucide-react` - Icônes
- `sonner` - Toasts
- `zod` - Validation
- `shadcn/ui` - Composants UI

---

## 🌐 Environnement

### **Variables d'environnement Backend** (`.env`)
```
PORT=3001
NODE_ENV=development
SUPABASE_URL=...
SUPABASE_KEY=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
```

### **Variables d'environnement Frontend** (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 📊 Workflows d'inscription

### **1. Inscription avec code** (`/register/with-code`)
1. Utilisateur entre code d'invitation
2. Backend vérifie le code → retourne `school_id`, `entry_year`, `school_name`
3. Formulaire pré-rempli avec école + promotion
4. Utilisateur complète prénom, nom, email, mot de passe
5. Création du compte → redirection `/login`

### **2. Demande d'accès initial** (`/register/request-access`)
1. Utilisateur sélectionne école + année (promotion inexistante)
2. Backend vérifie que la promotion n'existe pas
3. Formulaire de demande (prénom, nom, email, message, veut être ambassadeur)
4. Demande enregistrée en BDD → en attente validation admin
5. Confirmation avec instructions

### **3. Demande code peer** (`/register/request-code`)
1. Utilisateur sélectionne école + année (promotion existante)
2. Backend vérifie existence + détecte ambassadeur
3. Formulaire de demande (prénom, nom, message)
4. Demande envoyée à l'ambassadeur ou un membre de la promo
5. Confirmation avec instructions

---

## 🎯 Validation dynamique

### **Année d'entrée** (`entry_year`)
- **Minimum** : `established_year` de l'école sélectionnée (ou 1950 par défaut)
- **Maximum** : Année actuelle + 1
- **Format** : YYYY (4 chiffres)
- **Validation** : Frontend (temps réel) + Backend (API)

### **Mot de passe**
- Minimum 8 caractères
- Au moins une majuscule
- Au moins une minuscule
- Au moins un chiffre

---

## 📝 Logging

- **Backend** : Winston (console + fichiers `logs/`)
- **Frontend** : Console (dev) + Sentry (production, à implémenter)

---

## 🔄 Déploiement

### **Backend**
- Port : `3001`
- Health check : `GET /health`
- Build : `npm run build` → `dist/`
- Start : `npm start`

### **Frontend**
- Port : `3000` (dev) / `3000` (prod)
- Build : `npm run build`
- Start : `npm start`

---

## 📚 Documentation

- **API** : `docs/api-reference/`
- **Architecture** : `docs/introduction/architecture.md`
- **Guides** : `docs/guides/`
- **GitBook** : `docs/` (généré automatiquement)

---

## 🐛 Debugging

### **Backend**
```bash
# Logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Test connexion DB
npm run db:test
```

### **Frontend**
- DevTools React
- Network tab (requêtes API)
- Console (erreurs)

---

## ✅ Checklist de développement

- [ ] Tests passent (`npm run test`)
- [ ] Lint passe (`npm run lint`)
- [ ] Build réussit (`npm run build`)
- [ ] Variables d'environnement configurées
- [ ] Documentation à jour
- [ ] Logs propres (pas de console.log en prod)

---

**Dernière mise à jour** : 2024

