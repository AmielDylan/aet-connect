# 🧪 PLAN DE TESTS - AET CONNECT FRONTEND

## Prérequis

- ✅ Backend tourne sur http://localhost:3001
- ✅ Frontend tourne sur http://localhost:3000
- ✅ Comptes de test disponibles :
  - Admin : test.admin@aetconnect.com / TestPass123!
  - Membre : test.membre@aetconnect.com / TestPass123!

---

## 1️⃣ TESTS D'AUTHENTIFICATION

### 1.1 Login - Succès

- [ ] Aller sur /login
- [ ] Entrer email valide + password valide
- [ ] Cliquer "Se connecter"
- [ ] **ATTENDU** : Toast "Connexion réussie" + Redirect /dashboard
- [ ] **ATTENDU** : Header affiche avatar avec bonnes initiales
- [ ] **ATTENDU** : Dashboard affiche bonnes données

### 1.2 Login - Échec (mauvais credentials)

- [ ] Aller sur /login
- [ ] Entrer email valide + mauvais password
- [ ] Cliquer "Se connecter"
- [ ] **ATTENDU** : Toast erreur avec message de l'API
- [ ] **ATTENDU** : Reste sur /login
- [ ] **ATTENDU** : Formulaire toujours accessible

### 1.3 Login - Validation formulaire

- [ ] Aller sur /login
- [ ] Essayer de soumettre formulaire vide
- [ ] **ATTENDU** : Messages d'erreur "Email requis", "Password requis"
- [ ] Entrer email invalide (ex: "test")
- [ ] **ATTENDU** : Message "Format d'email invalide"
- [ ] Entrer password < 8 caractères
- [ ] **ATTENDU** : Message "Minimum 8 caractères"

### 1.4 Login - Redirect si déjà connecté

- [ ] Se connecter
- [ ] Aller sur /dashboard
- [ ] Dans URL, taper /login
- [ ] **ATTENDU** : Redirect automatique vers /dashboard

### 1.5 Logout

- [ ] Se connecter
- [ ] Cliquer sur avatar
- [ ] Cliquer "Se déconnecter"
- [ ] **ATTENDU** : Toast "Déconnexion réussie"
- [ ] **ATTENDU** : Redirect vers /login
- [ ] **ATTENDU** : Essayer d'aller sur /dashboard → Redirect /login

---

## 2️⃣ TESTS DE PROTECTION DE ROUTES

### 2.1 Accès non autorisé

- [ ] Sans être connecté, aller sur /dashboard
- [ ] **ATTENDU** : Redirect automatique vers /login
- [ ] Sans être connecté, aller sur /dashboard/profile
- [ ] **ATTENDU** : Redirect automatique vers /login
- [ ] Sans être connecté, aller sur /dashboard/schools
- [ ] **ATTENDU** : Redirect automatique vers /login

### 2.2 Routes publiques

- [ ] Sans être connecté, aller sur /login
- [ ] **ATTENDU** : Page accessible
- [ ] Sans être connecté, aller sur /
- [ ] **ATTENDU** : Redirect vers /login ou /dashboard selon auth

---

## 3️⃣ TESTS DE CACHE ET CHANGEMENT DE COMPTE

### 3.1 Cache vidé au logout (BUG PRÉCÉDENT)

- [ ] Login avec test.admin@aetconnect.com
- [ ] Noter les données affichées (nom, email, stats)
- [ ] Logout
- [ ] Login avec test.membre@aetconnect.com
- [ ] **ATTENDU** : Données du MEMBRE affichées (pas de l'admin)
- [ ] **ATTENDU** : Nom = "Jean", Email = test.membre@aetconnect.com
- [ ] **ATTENDU** : Stats du membre (pas de l'admin)

### 3.2 Cache cohérent après refresh

- [ ] Se connecter avec test.membre@aetconnect.com
- [ ] Aller sur /dashboard
- [ ] Rafraîchir la page (F5)
- [ ] **ATTENDU** : Skeleton brièvement visible
- [ ] **ATTENDU** : Même données rechargées
- [ ] **ATTENDU** : Pas de flash ou données incorrectes

---

## 4️⃣ TESTS DASHBOARD ALUMNI

### 4.1 Affichage données Alumni

- [ ] Login avec test.membre@aetconnect.com
- [ ] **ATTENDU** : "Bienvenue, Jean !"
- [ ] **ATTENDU** : 3 stats cards visibles
- [ ] **ATTENDU** : Card "Mon École" visible
- [ ] **ATTENDU** : Card "Mes Informations" visible

### 4.2 Données Alumni correctes

- [ ] Vérifier Stats Card 1 :
  - Titre : "Événements participés"
  - Valeur : 13 (ou valeur réelle depuis API)
- [ ] Vérifier Stats Card 2 :
  - Titre : "Codes d'invitation"
  - Valeur : "3 / 3" (ou valeur réelle)
- [ ] Vérifier Stats Card 3 :
  - Titre : "Statut"
  - Valeur : "Membre" ou "Ambassadeur" selon is_ambassador

### 4.3 École et Infos

- [ ] Vérifier Card École :
  - Nom : Prytanée Militaire de Libreville (PML)
  - Pays : Gabon
  - Badge Promo : 2020
- [ ] Vérifier Card Infos :
  - Email : test.membre@aetconnect.com
  - Ville : Paris
  - Rôle : alumni

---

## 5️⃣ TESTS DASHBOARD ADMIN

### 5.1 Détection rôle Admin

- [ ] Login avec test.admin@aetconnect.com
- [ ] **ATTENDU** : Dashboard Admin affiché (pas Alumni)
- [ ] **ATTENDU** : "Administration" en titre
- [ ] **ATTENDU** : 4 KPI cards visibles

### 5.2 KPI Cards Admin

- [ ] Vérifier Card 1 : "Total Utilisateurs" → 25 (ou valeur API)
- [ ] Vérifier Card 2 : "Total Événements" → 54 (ou valeur API)
- [ ] Vérifier Card 3 : "Codes Générés" → 210 (ou valeur API)
- [ ] Vérifier Card 4 : "Demandes en attente" → 4 (ou valeur API)

### 5.3 Graphiques Admin

- [ ] Vérifier graphique "Utilisateurs par École" :
  - Graphique Recharts visible
  - Barres affichées
  - Top 10 écoles maximum
- [ ] Vérifier card "Répartition par Rôle" :
  - Alumni : 23
  - Modérateurs : 0
  - Admins : 2

---

## 6️⃣ TESTS NAVIGATION

### 6.1 Sidebar Desktop

- [ ] Vérifier 3 liens visibles :
  - Dashboard
  - Mon Profil
  - Écoles
- [ ] Cliquer "Dashboard"
- [ ] **ATTENDU** : Lien actif (fond gris)
- [ ] **ATTENDU** : URL = /dashboard
- [ ] Cliquer "Mon Profil"
- [ ] **ATTENDU** : Redirect /dashboard/profile
- [ ] Cliquer "Écoles"
- [ ] **ATTENDU** : Redirect /dashboard/schools

### 6.2 Sidebar Mobile

- [ ] Réduire fenêtre (< 768px)
- [ ] **ATTENDU** : Sidebar cachée
- [ ] **ATTENDU** : Bouton hamburger visible
- [ ] Cliquer hamburger
- [ ] **ATTENDU** : Sidebar s'ouvre en overlay
- [ ] Cliquer sur overlay (fond)
- [ ] **ATTENDU** : Sidebar se ferme
- [ ] Rouvrir sidebar, cliquer sur un lien
- [ ] **ATTENDU** : Navigation + sidebar se ferme

### 6.3 Header User Menu

- [ ] Cliquer sur avatar
- [ ] **ATTENDU** : Dropdown s'ouvre
- [ ] **ATTENDU** : Nom + email affichés
- [ ] **ATTENDU** : Lien "Mon profil" visible
- [ ] **ATTENDU** : Bouton "Se déconnecter" visible
- [ ] Cliquer "Mon profil"
- [ ] **ATTENDU** : Redirect /dashboard/profile

---

## 7️⃣ TESTS ÉTATS DE CHARGEMENT

### 7.1 Loading states

- [ ] Vider cache (DevTools → Clear storage)
- [ ] Se connecter
- [ ] **ATTENDU** : Skeletons affichés brièvement
- [ ] **ATTENDU** : Skeletons remplacés par vraies données
- [ ] **ATTENDU** : Pas de flash de contenu

### 7.2 Error states

- [ ] Arrêter le backend
- [ ] Se connecter (avec cache vidé)
- [ ] **ATTENDU** : Message d'erreur visible
- [ ] **ATTENDU** : Bouton "Réessayer" visible
- [ ] Redémarrer backend
- [ ] Cliquer "Réessayer"
- [ ] **ATTENDU** : Données se chargent

---

## 8️⃣ TESTS PAGES SECONDAIRES

### 8.1 Page Profil

- [ ] Aller sur /dashboard/profile
- [ ] **ATTENDU** : Page basique affichée
- [ ] **ATTENDU** : Titre "Mon Profil" ou similaire
- [ ] **ATTENDU** : Pas de 404

### 8.2 Page Écoles

- [ ] Aller sur /dashboard/schools
- [ ] **ATTENDU** : Page basique affichée
- [ ] **ATTENDU** : Titre "Écoles" ou similaire
- [ ] **ATTENDU** : Pas de 404

---

## 9️⃣ TESTS RESPONSIVE

### 9.1 Desktop (> 1024px)

- [ ] Sidebar visible fixe à gauche
- [ ] Header responsive
- [ ] Cards en grid 3 colonnes
- [ ] Tout lisible et bien espacé

### 9.2 Tablet (768px - 1024px)

- [ ] Sidebar visible OU cachée selon breakpoint
- [ ] Cards en grid 2 colonnes
- [ ] Pas de scroll horizontal

### 9.3 Mobile (< 768px)

- [ ] Sidebar cachée par défaut
- [ ] Bouton hamburger visible
- [ ] Cards en 1 colonne
- [ ] Textes lisibles
- [ ] Boutons accessibles

---

## 🔟 TESTS DE RÉGRESSION (À CHAQUE MODIFICATION)

### 10.1 Checklist rapide

- [ ] npm run build → Passe sans erreur
- [ ] npm run lint → Aucune erreur
- [ ] Login admin → Dashboard admin
- [ ] Logout → Login membre → Dashboard membre (données membre)
- [ ] Navigation sidebar → Toutes les pages accessibles
- [ ] Responsive → Mobile, tablet, desktop OK

---

## 📊 RÉSUMÉ DES TESTS

**Total tests** : ~80 vérifications

**Répartition** :
- Auth : 15 tests
- Protection routes : 5 tests
- Cache : 5 tests
- Dashboard Alumni : 10 tests
- Dashboard Admin : 10 tests
- Navigation : 12 tests
- Loading/Error : 8 tests
- Pages secondaires : 5 tests
- Responsive : 10 tests
- Régression : Checklist continue

**Priorité** :
- 🔴 Critique : Auth, Protection routes, Cache
- 🟠 Important : Dashboards, Navigation
- 🟡 Moyen : Loading, Responsive
- 🟢 Bonus : Error recovery, Edge cases

---

## 🤖 TESTS AUTOMATISÉS (À IMPLÉMENTER PLUS TARD)

Pour l'avenir, créer :

1. **Tests E2E avec Playwright** :
   - Login/Logout flows
   - Navigation complète
   - Changement de compte
   
2. **Tests d'intégration avec Testing Library** :
   - Composants avec vraies données
   - States loading/error
   - User interactions

3. **Tests unitaires avec Vitest** :
   - Utils functions
   - Hooks personnalisés
   - Store Zustand

---

## ✅ VALIDATION FINALE

Avant de considérer le frontend "terminé" :

- [ ] Tous les tests manuels passent
- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur Lint
- [ ] Build production réussit
- [ ] Tests avec 2 comptes différents OK
- [ ] documentation à jour

