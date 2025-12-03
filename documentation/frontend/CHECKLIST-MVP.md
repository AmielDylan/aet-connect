# ✅ CHECKLIST MVP - AET CONNECT FRONTEND

**Date** : 16 Novembre 2025  
**Version** : 1.0.0 MVP  
**Status** : En validation

---

## 🎯 TESTS CRITIQUES (À FAIRE MAINTENANT)

### 1. BUILD & COMPILATION ⚙️

- [ ] `npm run build` → Passe sans erreur
- [ ] `npm run lint` → Aucune erreur (warnings OK)
- [ ] Aucune erreur TypeScript dans le terminal
- [ ] Aucun warning critique dans la console

---

### 2. AUTHENTIFICATION 🔐

#### Login
- [ ] Aller sur http://localhost:3000
- [ ] Redirect automatique vers /login
- [ ] Login avec `test.membre@aetconnect.com` / `TestPass123!`
- [ ] Toast "Connexion réussie"
- [ ] Redirect vers /dashboard
- [ ] Dashboard Alumni affiché

#### Logout
- [ ] Cliquer sur avatar → "Se déconnecter"
- [ ] Toast "Déconnexion réussie"
- [ ] Redirect vers /login

#### Protection de routes
- [ ] Logout puis aller sur /dashboard
- [ ] Redirect automatique vers /login

---

### 3. DASHBOARD ALUMNI 📊

- [ ] Login avec `test.membre@aetconnect.com`
- [ ] Titre : "Bienvenue, Jean !"
- [ ] 3 Stats Cards :
  - [ ] Événements participés : 13
  - [ ] Codes d'invitation : 3 / 3
  - [ ] Statut : Membre
- [ ] Card "Mon École" :
  - [ ] Nom : Prytanée Militaire de Libreville (PML)
  - [ ] Pays : Gabon
  - [ ] Badge : Promo 2020
- [ ] Card "Mes Informations" :
  - [ ] Email : test.membre@aetconnect.com
  - [ ] Ville : Paris
  - [ ] Rôle : alumni

---

### 4. DASHBOARD ADMIN 👑

- [ ] Logout puis login avec `test.admin@aetconnect.com`
- [ ] Titre : "Administration"
- [ ] 4 KPI Cards :
  - [ ] Total Utilisateurs : 25
  - [ ] Total Événements : 54
  - [ ] Codes Générés : 210
  - [ ] Demandes en attente : 4
- [ ] Card "Répartition par Rôle" :
  - [ ] Alumni : 23
  - [ ] Modérateurs : 0
  - [ ] Admins : 2

---

### 5. CHANGEMENT DE COMPTE (BUG CACHE) 🔄

- [ ] Login avec admin
- [ ] Noter le nom affiché : "Paul"
- [ ] Logout
- [ ] Login avec membre
- [ ] **CRITIQUE** : Nom affiché = "Jean" (pas "Paul")
- [ ] Dashboard affiche données du membre (pas admin)

---

### 6. PAGE PROFIL 👤

- [ ] Connecté, aller sur /dashboard/profile
- [ ] Header avec avatar "JM"
- [ ] Badges : alumni, Actif
- [ ] Section "Informations Personnelles" visible
- [ ] Section "Parcours Militaire" visible
- [ ] Section "Statistiques" visible
- [ ] Section "Paramètres de Confidentialité" visible
- [ ] Toutes les données affichées correctement

---

### 7. PAGE ÉCOLES 🏫

- [ ] Aller sur /dashboard/schools
- [ ] Badge : "9 écoles enregistrées"
- [ ] Grid avec 9 cards visibles
- [ ] Taper "Gabon" dans recherche
- [ ] Cards filtrées (1 école visible)
- [ ] Taper "xyz"
- [ ] Message "Aucune école ne correspond"
- [ ] Cliquer "Réinitialiser la recherche"
- [ ] 9 écoles de nouveau visibles

---

### 8. NAVIGATION 🧭

#### Sidebar Desktop
- [ ] Sidebar visible à gauche
- [ ] 3 liens : Dashboard, Mon Profil, Écoles
- [ ] Cliquer "Dashboard" → lien actif (fond gris)
- [ ] Cliquer "Mon Profil" → navigation OK
- [ ] Cliquer "Écoles" → navigation OK

#### Header
- [ ] Logo "AET" visible
- [ ] Avatar avec bonnes initiales
- [ ] Cliquer avatar → dropdown s'ouvre
- [ ] Nom + email affichés
- [ ] Lien "Mon profil" → navigation OK
- [ ] Bouton "Se déconnecter" → logout OK

---

### 9. RESPONSIVE 📱

#### Mobile (< 768px)
- [ ] Réduire fenêtre
- [ ] Sidebar cachée
- [ ] Bouton hamburger visible
- [ ] Cliquer hamburger → sidebar s'ouvre
- [ ] Cliquer sur overlay → sidebar se ferme
- [ ] Dashboard cards en 1 colonne
- [ ] Tout lisible

---

### 10. ÉTATS UI 🎨

#### Loading
- [ ] Vider cache (DevTools)
- [ ] Rafraîchir page dashboard
- [ ] Skeletons visibles brièvement
- [ ] Puis vraies données

#### Error
- [ ] Arrêter backend
- [ ] Rafraîchir dashboard
- [ ] Message d'erreur visible
- [ ] Bouton "Réessayer" visible
- [ ] Redémarrer backend
- [ ] Cliquer "Réessayer"
- [ ] Données se chargent

---

## 📊 RÉSULTAT

**Tests réussis** : __ / 70

### Bloquants (doivent tous passer) ❌
- Build & Compilation
- Login / Logout
- Protection routes
- Changement de compte (cache)

### Importants (doivent passer) ⚠️
- Dashboard Alumni
- Dashboard Admin
- Navigation

### Bonus (nice to have) ✨
- Responsive mobile
- États loading/error

---

## ✅ VALIDATION FINALE

- [ ] Tous les tests bloquants passent
- [ ] Au moins 90% des tests importants passent
- [ ] Aucun bug critique
- [ ] README.md à jour
- [ ] Code committé et pushé

**MVP PRÊT POUR DÉMO** : ☐ OUI  ☐ NON

---

## 📝 NOTES

*(Ajouter ici les bugs trouvés ou améliorations à faire)*

---

**Validé par** : ___________  
**Date** : ___________

