# 📊 PHASE 1 : ANALYSE DE L'EXISTANT - Migration vers Supabase Auth

## ÉTAPE 1.1 : Fichiers à modifier

### Backend

| Fichier | Statut | Notes |
|---------|--------|-------|
| `backend/src/routes/auth.routes.ts` | ✅ **EXISTE** | Routes login, logout, refresh, me |
| `backend/src/services/auth.service.ts` | ✅ **EXISTE** | Service avec login, refreshToken, getAuthenticatedUser, changePassword |
| `backend/src/middleware/auth.middleware.ts` | ✅ **EXISTE** | Middleware JWT custom avec authMiddleware, adminMiddleware, moderatorMiddleware |

### Frontend

| Fichier | Statut | Notes |
|---------|--------|-------|
| `frontend/lib/supabase.ts` | ✅ **EXISTE** | Client Supabase (mais avec persistSession: false) |
| `frontend/store/auth-store.ts` | ✅ **EXISTE** | Store Zustand utilisant apiClient.login() |
| `frontend/app/(auth)/login/page.tsx` | ✅ **EXISTE** | Page login utilisant useAuth() |
| `frontend/proxy.ts` | ✅ **EXISTE** | Middleware Next.js vérifiant access_token cookie |
| `frontend/lib/api.ts` | ✅ **EXISTE** | API client avec login(), logout(), refreshToken(), setToken(), getToken(), clearToken() |

## ÉTAPE 1.2 : Vérification table users

⚠️ **À vérifier dans Supabase Dashboard** :
- La table `users` existe-t-elle ?
- Colonne `id` est-elle de type UUID ?
- Est-elle liée à `auth.users` de Supabase ?

## 📋 Résumé

### Fichiers à créer :
1. `backend/src/middleware/supabase-auth.middleware.ts` (nouveau middleware)

### Fichiers à modifier :
1. `backend/src/routes/auth.routes.ts` (simplifier)
2. `backend/src/middleware/auth.middleware.ts` (remplacer ou adapter)
3. Toutes les routes protégées (remplacer authMiddleware)
4. `frontend/store/auth-store.ts` (utiliser supabase.auth.signInWithPassword)
5. `frontend/app/(auth)/login/page.tsx` (simplifier)
6. `frontend/proxy.ts` (utiliser Supabase SSR)
7. `frontend/lib/api.ts` (supprimer méthodes auth, utiliser token Supabase)
8. `frontend/lib/supabase.ts` (activer persistSession)

### Dépendances à installer :
- Frontend : `@supabase/ssr`

---

## ⏭️ Prochaine étape

**PHASE 2** : Création du nouveau middleware Supabase Auth backend



