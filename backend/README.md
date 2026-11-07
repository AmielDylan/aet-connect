# 🎓 AET Connect - Backend API V1

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Tests](https://img.shields.io/badge/tests-139%2F139-success)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

Annuaire panafricain des Anciens Enfants de Troupe - API REST complète

📚 **[Documentation complète](https://amieldylan.github.io/AET-Connect/)**

## 🚀 Statistiques

- **40 endpoints** fonctionnels
- **139 tests E2E** (100% réussite)
- **7 modules** complets
- **5 rapports** professionnels

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Configuration

Aucun fichier `.env` : les variables viennent de Doppler (config `dev_backend`). Voir la section « Démarrage rapide » du [README racine](../README.md) (`doppler setup`, `supabase start`).

### 3. Test connexion base de données

```bash
doppler run -- npm run db:test
```

### 4. Démarrer le serveur

```bash
npm run dev
```

Le serveur démarre sur http://localhost:3001

## 📁 Structure

```
src/
├── routes/         # Routes API Express
├── controllers/    # Logique métier
├── services/       # Services (DB, emails, etc.)
├── middleware/     # Middlewares Express
├── models/         # Types TypeScript
├── utils/          # Utilitaires
├── config/         # Configuration
└── app.ts          # Application principale
```

## 🗄️ Base de données

6 tables Supabase :

- `schools` - Écoles militaires (9 écoles)
- `users` - Utilisateurs inscrits
- `invitation_codes` - Codes d'invitation
- `access_requests` - Demandes d'accès initiales
- `events` - Événements de networking
- `event_participants` - Inscriptions aux événements

## 📚 API Endpoints (à développer)

### Registration

- `POST /api/register/check-school-promo`
- `POST /api/register/request-initial-access`
- `POST /api/register/verify-invitation-code`
- `POST /api/register/complete-registration`
- `POST /api/register/request-code-from-peer`

### Events

- `GET /api/events`
- `POST /api/events`
- `GET /api/events/:id`
- `POST /api/events/:id/register`

### Admin

- `GET /api/admin/access-requests`
- `POST /api/admin/access-requests/:id/approve`
- `POST /api/admin/access-requests/:id/reject`

### Users

- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/users` (annuaire)

### Schools

- `GET /api/schools`
- `GET /api/schools/:id`

## 🛠️ Scripts

```bash
npm run dev          # Développement avec hot-reload
npm run build        # Build production
npm start            # Démarrer en production
npm run db:test      # Tester connexion DB
npm test             # Tests
```

## 📝 Développement progressif

1. ✅ Structure de base
2. ⏳ Module Registration
3. ⏳ Module Events
4. ⏳ Module Admin
5. ⏳ Module Users
6. ⏳ Module Auth

## 📄 License

MIT

