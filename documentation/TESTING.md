# 🧪 Tests AET Connect Backend

## 📁 Structure

```
tests/
├── e2e/                          # Tests end-to-end
│   ├── registration/              # Workflows d'inscription
│   │   ├── invitation-logic.test.ts
│   │   ├── invitation-validation.test.ts
│   │   ├── edge-cases.test.ts
│   │   └── roles.test.ts
│   ├── auth/                      # Authentification
│   │   └── authentication.test.ts
│   ├── events/                    # Événements
│   │   ├── events-complete.test.ts
│   │   ├── events-advanced.test.ts
│   │   └── events-status.test.ts
│   ├── admin/                     # Administration
│   │   └── admin-complete.test.ts
│   ├── schools/                   # Écoles
│   │   └── schools-complete.test.ts
│   ├── users/                     # Utilisateurs
│   │   └── users-complete.test.ts
│   └── complete/                  # Tests complets
│       └── all-routes.test.ts
│
├── integration/                   # Tests d'intégration
│   └── services/
│
├── unit/                          # Tests unitaires
│   ├── utils/
│   └── validators/
│
├── seed-test-data.ts              # Créer données de test
├── test-workflow-with-code.ts     # Test workflow "Inscription avec code"
├── test-workflow-request-access.ts # Test workflow "Demande accès initial"
├── test-workflow-request-code.ts  # Test workflow "Demande code peer"
├── verify-test-results.ts         # Vérifier résultats en BDD
└── run-all-tests.ts               # Orchestrateur principal
```

---

## 🚀 Utilisation

### **Option 1 : Exécuter TOUS les tests (RECOMMANDÉ)**

```bash
cd backend
npx tsx tests/run-all-tests.ts
```

Cette commande va :
1. ✅ Créer des codes d'invitation de test
2. ✅ Tester chaque workflow d'inscription
3. ✅ Vérifier les données en BDD
4. ✅ Afficher un rapport complet

**Durée estimée :** 15-20 secondes

---

### **Option 2 : Tests E2E par module**

```bash
# Registration
npm run test:e2e:registration

# Auth
npm run test:e2e:auth

# Events
npm run test:e2e:events

# Admin
npm run test:e2e:admin

# Schools
npm run test:e2e:schools

# Users
npm run test:e2e:users

# Tous les tests E2E
npm run test:e2e
```

---

### **Option 3 : Tests workflows individuels**

#### **1. Créer les données de test**
```bash
npx tsx tests/seed-test-data.ts
```

**Résultat :**
- Codes ADMIN créés pour chaque école
- Codes MEMBRE créés pour promos existantes
- Code UNIVERSEL créé (10 utilisations)

#### **2. Tester "Inscription avec code"**
```bash
npx tsx tests/test-workflow-with-code.ts
```

**Teste :**
- ✅ Vérification du code d'invitation
- ✅ Retour de `school_name` dans la réponse
- ✅ Création du compte utilisateur
- ✅ Format `entry_year` en YYYY
- ✅ Marquage du code comme utilisé

#### **3. Tester "Demande d'accès initial"**
```bash
npx tsx tests/test-workflow-request-access.ts
```

**Teste :**
- ✅ Vérification promo inexistante
- ✅ Création demande ambassadeur
- ✅ Validation année selon `established_year`
- ✅ Enregistrement en BDD

#### **4. Tester "Demande code peer"**
```bash
npx tsx tests/test-workflow-request-code.ts
```

**Teste :**
- ✅ Vérification promo existante
- ✅ Détection ambassadeur
- ✅ Envoi demande de code
- ✅ Validation année

#### **5. Vérifier les résultats**
```bash
npx tsx tests/verify-test-results.ts
```

**Affiche :**
- ✅ Nouveaux utilisateurs créés
- ✅ Demandes d'accès enregistrées
- ✅ Validation format `entry_year`
- ✅ Statut des codes

---

## 📊 Ordre d'exécution recommandé

### **1. Tests unitaires** (rapides)
```bash
# À venir
```

### **2. Tests d'intégration** (moyens)
```bash
# À venir
```

### **3. Tests E2E** (complets)
```bash
npm run test:e2e
```

### **4. Tests workflows** (scénarios réels)
```bash
npx tsx tests/run-all-tests.ts
```

---

## ✅ Checklist de validation

Après avoir exécuté les tests, vérifier :

- [ ] Codes d'invitation créés (minimum 3)
- [ ] Utilisateur créé avec `entry_year` au format YYYY
- [ ] `school_name` retourné par `verifyInvitationCode`
- [ ] Code marqué comme utilisé après inscription
- [ ] Demande d'accès créée avec `is_ambassador = true`
- [ ] Validation `established_year` fonctionne
- [ ] Aucune erreur TypeScript/BDD

---

## 🎯 Codes créés par le seed

Le script `seed-test-data.ts` crée automatiquement :

- **1 code ADMIN par école** : `ADMIN-XXX-2000`
- **1 code MEMBRE par école** : `MEMBER-XXX-2000-TEST`
- **1 code UNIVERSEL** : `ADMIN-UNIVERSAL-TEST` (10 utilisations)

Tous les codes utilisent l'année 2000 ou l'année minimale de l'école si elle a été créée après 2000.

---

## 🐛 En cas d'erreur

### **Erreur : "Aucune école trouvée"**
```bash
# Vérifier les écoles en BDD
npx tsx -e "import {createClient} from '@supabase/supabase-js'; const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!); const {data} = await supabase.from('schools').select('*'); console.log(data); process.exit()"
```

### **Erreur : "Code déjà utilisé"**
```bash
# Re-exécuter le seed pour créer de nouveaux codes
npx tsx tests/seed-test-data.ts
```

### **Erreur : "established_year non défini"**
```bash
# Vérifier que les écoles ont un established_year
# Mettre à jour si nécessaire
```

---

## 📝 Exemple de sortie réussie

```
🚀 SUITE DE TESTS COMPLÈTE - AET CONNECT
================================================================================

▶️  Exécution: seed-test-data.ts
🌱 SEED DES DONNÉES DE TEST
📚 3 écoles trouvées
✅ Code admin: ADMIN-COL-2000
✅ Code membre: MEMBER-COL-2000-TEST
✅ Code universel: ADMIN-UNIVERSAL-TEST
✅ Codes insérés avec succès

▶️  Exécution: test-workflow-with-code.ts
🧪 TEST WORKFLOW: Inscription avec code
📌 ÉTAPE 1: Vérification du code
✅ school_name retourné: "Collège Militaire Eyadema (CME) (Togo)"
📌 ÉTAPE 2: Création du compte
✅ Utilisateur créé: Jean Testeur
✅ Format entry_year: YYYY (2000)
✅ Code marqué comme utilisé

▶️  Exécution: test-workflow-request-access.ts
🧪 TEST WORKFLOW: Demande d'accès initial
✅ Demande créée: Marie Pionnière
✅ Ambassadeur: OUI
✅ Format entry_year: YYYY (2026)

▶️  Exécution: test-workflow-request-code.ts
🧪 TEST WORKFLOW: Demande code peer
✅ Promo existe: true
✅ Demande enregistrée

▶️  Exécution: verify-test-results.ts
🔍 VÉRIFICATION POST-TESTS
✅ Tous les entry_year sont au format YYYY

🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !
```

---

## 🔄 Reset complet

Pour repartir de zéro :

```bash
# 1. Supprimer tous les utilisateurs/codes de test
# (à faire manuellement ou via script SQL)

# 2. Re-exécuter le seed
npx tsx tests/seed-test-data.ts

# 3. Re-exécuter les tests
npx tsx tests/run-all-tests.ts
```

---

## 📚 documentation

- **Architecture** : Voir `ARCHITECTURE.md` à la racine
- **API** : Voir `docs/api-reference/`
- **Guides** : Voir `docs/guides/`
