# 📁 Structure du projet AET Connect

## Arborescence complète

```
AET-Connect/
├── README.md                    # documentation principale
│
├── documentation/               # documentation complète
│   ├── ARCHITECTURE.md         # Architecture système
│   ├── RECAP.md                # Récapitulatif projet
│   ├── STRUCTURE.md           # Ce fichier
│   ├── TESTING.md             # Guide des tests
│   │
│   ├── backend/               # documentation backend
│   │   ├── api-reference/     # documentation API
│   │   ├── authentication/    # documentation auth
│   │   ├── introduction/      # Introduction backend
│   │   └── reports/           # Rapports de tests
│   │
│   ├── frontend/              # documentation frontend
│   │   ├── README.md
│   │   ├── CHECKLIST-MVP.md
│   │   └── TESTS.md
│   │
│   └── scripts/               # documentation scripts
│       └── README.md
│
├── backend/                    # Backend API
│   ├── src/                   # Code source
│   │   ├── app.ts             # Point d'entrée
│   │   ├── config/            # Configuration
│   │   ├── controllers/       # Contrôleurs API
│   │   ├── services/          # Services métier
│   │   ├── models/            # Modèles TypeScript
│   │   ├── routes/            # Routes Express
│   │   ├── middleware/        # Middlewares
│   │   └── utils/             # Utilitaires
│   │
│   ├── scripts/               # Scripts utilitaires
│   │   ├── migrations/        # Migrations DB
│   │   ├── setup/             # Setup données
│   │   └── reports/           # Génération rapports
│   │
│   ├── tests/                 # Tests backend
│   │   ├── e2e/               # Tests end-to-end
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── events/
│   │   │   ├── registration/
│   │   │   ├── schools/
│   │   │   ├── users/
│   │   │   ├── complete/
│   │   │   └── workflows/     # Tests workflows
│   │   ├── fixtures/          # Données de test
│   │   ├── utils/             # Utilitaires tests
│   │   └── run-all-tests.ts   # Orchestrateur
│   │
│   ├── dist/                  # Build TypeScript
│   ├── logs/                  # Logs application
│   ├── .env.local             # Variables d'environnement
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                  # Frontend Next.js
    ├── app/                   # Pages Next.js (App Router)
    │   ├── (auth)/            # Routes authentifiées
    │   ├── dashboard/          # Dashboard utilisateur
    │   ├── register/          # Workflows inscription
    │   └── page.tsx           # Page d'accueil
    │
    ├── components/            # Composants React
    │   ├── ui/                # Composants Shadcn/ui
    │   ├── registration/      # Composants inscription
    │   ├── dashboard/         # Composants dashboard
    │   └── layout/            # Composants layout
    │
    ├── lib/                   # Utilitaires
    │   ├── api.ts             # Client API
    │   └── utils.ts           # Utilitaires
    │
    ├── tests/                 # Tests frontend
    │   ├── unit/              # Tests unitaires
    │   ├── integration/       # Tests intégration
    │   ├── e2e/               # Tests E2E
    │   └── utils/             # Utilitaires tests
    │
    ├── hooks/                 # Hooks React
    ├── store/                 # State management
    ├── types/                 # Types TypeScript
    ├── public/                # Assets statiques
    ├── .env.local             # Variables d'environnement
    ├── package.json
    └── tsconfig.json
```

## 📊 Statistiques

- **Fichiers .md** : 36+ dans documentation/
- **Tests backend** : 21 fichiers
- **Tests frontend** : 1 fichier (structure créée)
- **Scripts backend** : 20 fichiers
- **Modules API** : 7 modules
- **Endpoints** : 40+ endpoints REST

## 📝 Notes

- `node_modules/`, `.next/`, `dist/`, `.git/` exclus de l'arborescence
- Tous les fichiers `.md` sont dans `documentation/` (sauf README.md racine)
- Tests organisés par type : unit/, integration/, e2e/
- Scripts utilitaires dans `backend/scripts/`

