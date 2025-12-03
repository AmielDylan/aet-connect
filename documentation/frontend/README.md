# 🎖️ AET Connect - Frontend

Frontend de l'application **AET Connect**, l'annuaire panafricain des Anciens Enfants de Troupe.

**Version** : 1.0.0 MVP  

**Status** : ✅ Production Ready  

**Framework** : Next.js 14 (App Router)

---

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Installation](#installation)
- [Développement](#développement)
- [Build Production](#build-production)
- [Structure du projet](#structure-du-projet)
- [Technologies](#technologies)
- [Fonctionnalités](#fonctionnalités)
- [Comptes de test](#comptes-de-test)
- [Scripts disponibles](#scripts-disponibles)
- [Tests](#tests)
- [Déploiement](#déploiement)

---

## 🔧 Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Backend AET Connect** tournant sur http://localhost:3001

---

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/AmielDylan/AET-Connect.git
cd AET-Connect/frontend

# Installer les dépendances
npm install

# Créer le fichier d'environnement
cp .env.example .env.local

# Éditer .env.local avec vos variables
```

### Variables d'environnement

Créer `.env.local` avec :

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🚀 Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Ouvrir http://localhost:3000
```

Le serveur de développement démarre avec :

- ✅ Hot reload automatique
- ✅ Fast refresh React
- ✅ Détection d'erreurs TypeScript

---

## 🏗️ Build Production

```bash
# Build de production
npm run build

# Démarrer en mode production
npm start
```

---

## 📁 Structure du projet

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/               # Page de connexion
│   │   └── layout.tsx
│   ├── dashboard/               # Dashboard protégé
│   │   ├── layout.tsx          # Layout avec Header + Sidebar
│   │   ├── page.tsx            # Dashboard Alumni/Admin
│   │   ├── profile/            # Page profil
│   │   └── schools/            # Page liste écoles
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Page d'accueil (redirections)
│   └── providers.tsx           # React Query + Auth init
│
├── components/
│   ├── ui/                     # Composants Shadcn/ui (11)
│   ├── layout/
│   │   ├── header.tsx         # Header avec user menu
│   │   └── sidebar.tsx        # Navigation sidebar
│   └── dashboard/
│       ├── stats-card.tsx     # Card statistique
│       └── user-chart.tsx     # Graphique Recharts
│
├── lib/
│   ├── api.ts                 # Client API avec JWT
│   └── utils.ts               # Utilitaires
│
├── hooks/
│   └── use-auth.ts            # Hook authentification
│
├── store/
│   └── auth-store.ts          # Zustand store
│
├── types/
│   └── index.ts               # Types TypeScript
│
├── TESTS.md                   # Plan de tests complet
├── CHECKLIST-MVP.md           # Checklist validation MVP
└── README.md                  # Ce fichier
```

---

## 🛠️ Technologies

### Core

- **Next.js 14** - Framework React avec App Router
- **TypeScript** - Typage strict
- **TailwindCSS** - Styling utility-first

### UI

- **Shadcn/ui** - Composants UI (11 composants)
- **Lucide React** - Icônes
- **Recharts** - Graphiques
- **Sonner** - Toast notifications

### State & Data

- **TanStack Query (React Query)** - Data fetching & cache
- **Zustand** - State management global (auth)

### Forms

- **React Hook Form** - Gestion formulaires
- **Zod** - Validation schémas

---

## ✨ Fonctionnalités

### ✅ Authentification

- [x] Login avec email/password
- [x] JWT Bearer tokens (stockage mémoire)
- [x] Logout avec invalidation cache
- [x] Protection de routes
- [x] Session persistante
- [x] Gestion erreurs API

### ✅ Dashboard Alumni

- [x] Stats personnelles (événements, codes)
- [x] Informations école
- [x] Statut (membre/ambassadeur)
- [x] Infos personnelles

### ✅ Dashboard Admin

- [x] KPIs plateforme (users, événements, codes)
- [x] Graphique utilisateurs par école
- [x] Répartition par rôle
- [x] Stats demandes d'accès

### ✅ Profil

- [x] Affichage complet du profil
- [x] Avatar avec initiales
- [x] Informations personnelles
- [x] Parcours militaire
- [x] Statistiques activité
- [x] Paramètres de confidentialité

### ✅ Écoles

- [x] Liste de toutes les écoles
- [x] Recherche en temps réel
- [x] Stats par école (membres, ambassadeurs)
- [x] Grid responsive

### ✅ Navigation

- [x] Sidebar avec 3 pages
- [x] Header avec user menu
- [x] Responsive mobile (hamburger menu)
- [x] Routes actives visuellement

### ✅ États UI

- [x] Loading states (skeletons)
- [x] Error states (retry)
- [x] Empty states
- [x] Toast notifications

---

## 👤 Comptes de test

### Compte Alumni

```
Email    : test.membre@aetconnect.com
Password : TestPass123!
```

### Compte Admin

```
Email    : test.admin@aetconnect.com
Password : TestPass123!
```

---

## 📜 Scripts disponibles

```bash
# Développement
npm run dev              # Serveur de dev (http://localhost:3000)

# Build
npm run build           # Build de production
npm start               # Démarrer en mode production

# Qualité de code
npm run lint            # ESLint
npm run type-check      # Vérification TypeScript

# Tests
npm run test:api        # Tests API client
```

---

## 🧪 Tests

### Tests manuels

Voir `TESTS.md` pour le plan de tests complet (~80 tests).

### Tests API

```bash
npm run test:api
```

Teste tous les endpoints API avec les vraies données du backend.

### Checklist MVP

Voir `CHECKLIST-MVP.md` pour la validation finale du MVP.

---

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement
vercel env add NEXT_PUBLIC_API_URL
```

### Docker

```bash
# Build l'image
docker build -t aet-connect-frontend .

# Run le container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:3001 aet-connect-frontend
```

---

## 📊 État du projet

### ✅ MVP Terminé (Phase 1)

**Fonctionnalités** :

- [x] Authentification complète
- [x] Dashboard Alumni/Admin
- [x] Page profil (lecture seule)
- [x] Liste écoles avec recherche
- [x] Navigation complète
- [x] Responsive mobile

**Tests** :

- [x] 100% compilation TypeScript
- [x] 0 erreur ESLint
- [x] Tests API passent
- [x] Tests manuels critiques OK

### 🔜 Phase 2 (En cours)

**Authentification avancée** :

- [ ] Inscription (3 workflows)
- [ ] Récupération mot de passe
- [ ] Validation email
- [ ] OAuth (Google, LinkedIn)

**Profil avancé** :

- [ ] Édition profil
- [ ] Upload avatar
- [ ] Gestion paramètres privacy
- [ ] Historique activité

**Fonctionnalités complètes** :

- [ ] Annuaire membres avec filtres
- [ ] Événements (liste, détail, inscription)
- [ ] Création événements
- [ ] Dashboard admin complet
- [ ] Messagerie

**Tests automatisés** :

- [ ] Tests E2E (Playwright)
- [ ] Tests d'intégration
- [ ] Tests unitaires (Vitest)

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Licence

MIT License - Copyright (c) 2025 AET Connect

---

## 👨‍💻 Auteur

**Amiel ADJOVI**  
GitHub: [@AmielDylan](https://github.com/AmielDylan)

---

## 🙏 Remerciements

- Backend AET Connect (23/23 tests E2E)
- Shadcn/ui pour les composants
- TanStack Query pour la gestion de données
- Next.js team pour le framework

---

**Made with ❤️ for the African Military Schools Alumni Community**
