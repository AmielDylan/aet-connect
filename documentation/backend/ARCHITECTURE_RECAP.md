# 🏗️ Récapitulatif Architecture - AET Connect Backend V1

**Date** : Novembre 2025  
**Version** : 1.0.0  
**Statut** : ✅ Production Ready

---

## 📋 Vue d'ensemble

AET Connect est une **API REST** complète construite avec **Node.js**, **Express.js** et **TypeScript** pour connecter les anciens élèves de 9 écoles militaires africaines.

### Statistiques

- **7 modules** fonctionnels
- **40 endpoints** API REST
- **23 tests E2E** (100% réussite)
- **139+ tests** au total (tous modules confondus)
- **Production ready** ✅

---

## 🛠️ Stack technique

### Core

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Node.js** | 18+ | Runtime |
| **Express.js** | 4.x | Framework web |
| **TypeScript** | 5.x | Langage (strict mode) |
| **PostgreSQL** | - | Base de données (via Supabase) |

### Authentification & Sécurité

| Technologie | Usage |
|-------------|-------|
| **JWT** (jsonwebtoken) | Tokens d'authentification |
| **bcrypt** | Hashing des mots de passe |
| **Zod** | Validation des données |
| **Helmet** | Sécurité HTTP |
| **CORS** | Gestion CORS |

### Outils & Libraries

| Technologie | Usage |
|-------------|-------|
| **Winston** | Logging |
| **Supabase JS** | Client PostgreSQL |
| **date-fns** | Manipulation dates |
| **tsx** | Exécution TypeScript |

---

## 📁 Structure du projet

```
backend/
├── src/
│   ├── app.ts                    # Application Express principale
│   │
│   ├── config/
│   │   ├── database.ts          # Client Supabase
│   │   ├── environment.ts       # Variables d'environnement
│   │   └── logger.ts            # Configuration Winston
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts         # Vérification JWT
│   │   ├── admin.middleware.ts        # Vérification rôle admin
│   │   ├── moderator.middleware.ts    # Vérification modérateur/admin
│   │   ├── validation.middleware.ts   # Validation Zod
│   │   ├── error.middleware.ts        # Gestion erreurs
│   │   └── logger.middleware.ts       # Logging requêtes
│   │
│   ├── routes/
│   │   ├── registration.routes.ts     # Module Registration
│   │   ├── auth.routes.ts             # Module Auth
│   │   ├── codes.routes.ts            # Module Codes
│   │   ├── events.routes.ts           # Module Events
│   │   ├── admin.routes.ts            # Module Admin
│   │   ├── users.routes.ts            # Module Users
│   │   └── schools.routes.ts         # Module Schools
│   │
│   ├── controllers/
│   │   ├── registration.controller.ts
│   │   ├── auth.controller.ts
│   │   ├── codes.controller.ts
│   │   ├── events.controller.ts
│   │   ├── admin.controller.ts
│   │   ├── users.controller.ts
│   │   └── schools.controller.ts
│   │
│   ├── services/
│   │   ├── registration.service.ts
│   │   ├── auth.service.ts
│   │   ├── codes.service.ts
│   │   ├── events.service.ts
│   │   ├── admin.service.ts
│   │   ├── users.service.ts
│   │   └── schools.service.ts
│   │
│   ├── models/
│   │   ├── registration.model.ts
│   │   ├── auth.model.ts
│   │   ├── event.model.ts
│   │   ├── user.model.ts
│   │   └── school.model.ts
│   │
│   └── utils/
│       ├── jwt.ts                 # Utilitaires JWT
│       ├── validations.ts         # Schémas Zod
│       └── logger.ts              # Logger Winston
│
├── tests/
│   └── e2e/
│       ├── registration/          # Tests Registration
│       ├── auth/                  # Tests Auth
│       ├── events/                # Tests Events
│       ├── admin/                 # Tests Admin
│       ├── schools/               # Tests Schools
│       ├── users/                 # Tests Users
│       └── complete/              # Tests complets (23 tests)
│
├── scripts/
│   ├── setup-test-users.ts
│   ├── generate-*-report.ts
│   └── ...
│
├── docs/
│   ├── README.md
│   ├── SUMMARY.md
│   ├── reports/                   # Rapports de tests
│   └── ...
│
└── package.json
```

---

## 🎯 Pattern architectural : MVC

### Routes (Couche HTTP)

**Responsabilité** : Définir les endpoints et appliquer les middlewares

```typescript
router.post('/events',
  authMiddleware,                    // Authentification requise
  validateRequest(CreateEventSchema), // Validation Zod
  eventsController.createEvent       // Handler
)
```

### Controllers (Couche Contrôleur)

**Responsabilité** : Gérer les requêtes/réponses HTTP

```typescript
async createEvent(req: Request, res: Response) {
  const event = await eventsService.create(req.body, req.user.id)
  res.status(201).json(event)
}
```

### Services (Couche Métier)

**Responsabilité** : Logique métier et interactions base de données

```typescript
async create(data: CreateEventRequest, userId: string) {
  // Validation business rules
  // Database operations
  // Return result
}
```

### Models (Couche Données)

**Responsabilité** : Types TypeScript et interfaces

```typescript
export interface Event {
  id: string
  title: string
  event_date: string
  // ...
}
```

---

## 🔐 Authentification JWT

### Tokens

| Type | Durée | Usage |
|------|-------|-------|
| **Access Token** | 15 minutes | Requêtes API protégées |
| **Refresh Token** | 7 jours | Renouveler access token |

### Flow

```
1. Login → POST /api/auth/login
   Body: { email, password }
   → Retourne: { access_token, refresh_token, user }

2. Requêtes protégées
   Header: Authorization: Bearer <access_token>
   → Middleware vérifie token et injecte req.user

3. Refresh (si access token expiré)
   POST /api/auth/refresh
   Body: { refresh_token }
   → Retourne: { access_token, refresh_token }
```

### Middlewares

- **authMiddleware** : Vérifie JWT, injecte `req.user`
- **adminMiddleware** : Vérifie `role === 'admin'`
- **moderatorMiddleware** : Vérifie `role === 'moderator' || 'admin'`

---

## 🗄️ Base de données (Supabase PostgreSQL)

### Tables principales

| Table | Description | Relations |
|-------|-------------|-----------|
| **users** | Utilisateurs (alumni, moderator, admin) | `belongs_to` schools |
| **schools** | 9 écoles militaires | `has_many` users |
| **invitation_codes** | Codes d'invitation | `belongs_to` users (created_by) |
| **access_requests** | Demandes d'accès initiales | `belongs_to` schools |
| **events** | Événements de networking | `belongs_to` users (created_by) |
| **event_participants** | Inscriptions aux événements | `belongs_to` events, users |
| **user_privacy_settings** | Paramètres confidentialité | `belongs_to` users (1:1) |

### Relations clés

```
User ──┬── belongs_to ──→ School
       │
       ├── has_many ──→ InvitationCodes (created_by)
       ├── has_one ───→ PrivacySettings
       └── has_many ──→ Events (created_by)

Event ──┬── belongs_to ──→ User (creator)
        │
        └── has_many ──→ EventParticipants

EventParticipant ──┬── belongs_to ──→ Event
                   └── belongs_to ──→ User
```

---

## 📦 Modules API

### 1. Schools (Public)

**Endpoints** : 3  
**Auth** : ❌ Non requis

- `GET /api/schools` - Liste avec stats agrégées
- `GET /api/schools/:id` - Détails école
- `GET /api/schools/:id/stats` - Statistiques détaillées

### 2. Auth

**Endpoints** : 4  
**Auth** : Mixte

- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion (✅ auth)
- `POST /api/auth/refresh` - Renouveler tokens
- `GET /api/auth/me` - Profil connecté (✅ auth)

### 3. Registration

**Endpoints** : 5  
**Auth** : ❌ Non requis

- `POST /api/register/check-school-promo` - Vérifier école+promo
- `POST /api/register/request-initial-access` - Demander accès
- `POST /api/register/verify-invitation-code` - Vérifier code
- `POST /api/register/complete-registration` - Finaliser inscription
- `POST /api/register/request-code-from-peer` - Demander code pair

### 4. Codes

**Endpoints** : 2  
**Auth** : ✅ Requis

- `POST /api/codes/generate` - Générer code
- `GET /api/codes/my-codes` - Mes codes générés

### 5. Events

**Endpoints** : 8  
**Auth** : Mixte

- `GET /api/events` - Liste (public)
- `POST /api/events` - Créer (✅ auth)
- `GET /api/events/:id` - Détails (public)
- `GET /api/events/:id/participants` - Participants (public)
- `PATCH /api/events/:id` - Modifier (✅ auth, créateur)
- `DELETE /api/events/:id` - Supprimer (✅ auth, créateur)
- `POST /api/events/:id/register` - S'inscrire (✅ auth)
- `DELETE /api/events/:id/unregister` - Se désinscrire (✅ auth)

### 6. Users

**Endpoints** : 6  
**Auth** : ✅ Requis

- `GET /api/users` - Annuaire (filtré par privacy)
- `GET /api/users/me` - Mon profil complet
- `PATCH /api/users/me` - Modifier mon profil
- `GET /api/users/me/privacy` - Mes paramètres privacy
- `PATCH /api/users/me/privacy` - Modifier privacy
- `GET /api/users/:id` - Profil public (selon privacy)

### 7. Admin

**Endpoints** : 12  
**Auth** : ✅ Requis (admin uniquement)

- `GET /api/admin/stats` - Statistiques globales
- `GET /api/admin/users` - Liste tous les utilisateurs
- `GET /api/admin/events` - Liste tous les événements
- `GET /api/admin/access-requests` - Demandes d'accès
- `POST /api/admin/access-requests/:id/approve` - Approuver
- `POST /api/admin/access-requests/:id/reject` - Rejeter
- `PATCH /api/admin/users/:id` - Modifier utilisateur
- `POST /api/admin/users/:id/set-ambassador` - Désigner ambassadeur
- `PATCH /api/admin/users/:id/increase-code-limit` - Augmenter limite
- `GET /api/admin/events/:id/participants` - Participants (admin)
- `PATCH /api/admin/events/:id` - Modifier n'importe quel événement
- `DELETE /api/admin/events/:id` - Supprimer n'importe quel événement

---

## 🔒 Sécurité

### Authentification

- ✅ JWT avec signature HMAC SHA-256
- ✅ Secret JWT sécurisé (variable d'environnement)
- ✅ Access token courte durée (15min)
- ✅ Refresh token longue durée (7j)
- ✅ Vérification stricte du type de token

### Mots de passe

- ✅ Hashing bcrypt (10 rounds)
- ✅ Jamais de mot de passe en clair dans les logs
- ✅ Comparaison sécurisée avec bcrypt.compare

### Validation

- ✅ Validation Zod sur tous les inputs
- ✅ Schémas stricts pour chaque endpoint
- ✅ Messages d'erreur clairs

### Privacy

- ✅ Privacy by design
- ✅ Utilisateur contrôle ses données
- ✅ Filtrage automatique selon privacy settings
- ✅ Soft delete (is_active) au lieu de DELETE

---

## 📊 Tests

### Structure

```
tests/e2e/
├── registration/     # 25 tests
├── auth/            # 9 tests
├── events/           # 30 tests
├── admin/            # 28 tests
├── schools/          # 6 tests
├── users/            # 17 tests
└── complete/         # 23 tests (tous endpoints)
```

### Couverture

- **Total tests E2E** : 139+
- **Tests complets** : 23 (100% réussite)
- **Taux réussite global** : 100%

### Exécution

```bash
# Tests par module
npm run test:e2e:registration
npm run test:e2e:auth
npm run test:e2e:events
npm run test:e2e:admin
npm run test:e2e:schools
npm run test:e2e:users

# Tests complets (tous endpoints)
npm run test:e2e:complete
```

---

## 🚀 Déploiement

### Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
```

### Scripts disponibles

```bash
npm run dev          # Développement (hot-reload)
npm run build        # Build production
npm start            # Production
npm run test:e2e:*   # Tests E2E
```

---

## 📈 Performance

### Optimisations

- ✅ Indexes sur colonnes recherchées
- ✅ Pagination sur toutes les listes
- ✅ Lazy loading des relations
- ✅ Soft delete (pas de DELETE réel)

### Monitoring

- ✅ Winston logging (fichiers + console)
- ✅ Error handling centralisé
- ✅ Health check endpoint (`/health`)

---

## 🎯 Points forts

1. **Architecture modulaire** : Séparation claire des responsabilités
2. **Type safety** : TypeScript strict mode
3. **Validation robuste** : Zod sur tous les inputs
4. **Sécurité** : JWT, bcrypt, privacy by design
5. **Tests complets** : 139+ tests E2E (100% réussite)
6. **documentation** : GitBook complète
7. **Production ready** : Tous les endpoints validés

---

## 🔮 Prochaines étapes

### Court terme

- ✅ Backend V1 complet
- ⏳ Frontend Next.js 14 + Shadcn UI

### Moyen terme

- Rate limiting
- Cache (Redis)
- Webhooks
- Notifications email

### Long terme

- GraphQL API
- Real-time (WebSockets)
- Mobile API
- Analytics

---

## 📚 documentation

- **documentation complète** : `backend/docs/`
- **Rapports de tests** : `backend/docs/reports/`
- **API Reference** : `backend/docs/api-reference/endpoints.md`

---

**Backend V1 - Production Ready ✅**

