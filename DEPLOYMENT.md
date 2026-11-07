# 🚀 Guide de Déploiement - AET Connect

Ce guide explique comment déployer AET Connect sur Railway (backend) et Vercel (frontend).

---

## 📋 Prérequis

- Compte [Railway](https://railway.app) pour le backend
- Compte [Vercel](https://vercel.com) pour le frontend
- Compte [Supabase](https://supabase.com) pour la base de données
- Repository GitHub connecté

---

## 🔧 Backend - Railway

### 1. Créer un nouveau projet Railway

1. Connectez-vous à [Railway](https://railway.app)
2. Cliquez sur "New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Choisissez le repository `AET-Connect`
5. Sélectionnez le dossier `backend`

### 2. Configurer les variables d'environnement

Les variables ne se saisissent pas dans Railway : elles viennent de la config Doppler **`prd_backend`** (projet `aet-connect`), via l'intégration Doppler → Railway (dashboard Doppler, *Integrations → Railway*, service `AET-Connect`, environnement `production`).

Variables attendues : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (héritées de `prd`), `SUPABASE_SERVICE_ROLE_KEY`, `FRONTEND_URL`, `JWT_SECRET`, `RESEND_API_KEY`. Railway fournit `PORT`.

### 3. Déploiement

Railway détecte automatiquement :
- **Build Command** : `npm run build`
- **Start Command** : `npm start`

Le backend sera disponible sur une URL comme : `https://aet-connect-production.up.railway.app`

---

## 🎨 Frontend - Vercel

### 1. Créer un nouveau projet Vercel

1. Connectez-vous à [Vercel](https://vercel.com)
2. Cliquez sur "Add New Project"
3. Importez le repository `AET-Connect`
4. Configurez :
   - **Framework Preset** : Next.js
   - **Root Directory** : `frontend`
   - **Build Command** : `npm run build`
   - **Output Directory** : `.next`

### 2. Configurer les variables d'environnement

Les variables ne se saisissent pas dans Vercel : elles viennent de la config Doppler **`prd_frontend`**, via l'intégration Doppler → Vercel (dashboard Doppler, *Integrations → Vercel*, environnement *Production*).

Variables attendues : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (héritées de `prd`), `NEXT_PUBLIC_API_URL`. La clé `service_role` n'arrive jamais sur Vercel.

⚠️ **IMPORTANT** : `NEXT_PUBLIC_API_URL` doit pointer vers l'URL Railway de votre backend, **sans** le préfixe `/api`.

### 3. Déploiement

Vercel déploie automatiquement à chaque push sur `main`.

Le frontend sera disponible sur une URL comme : `https://aet-connect.vercel.app`

---

## ✅ Vérification

### Backend

Testez l'endpoint de santé :
```bash
curl https://aet-connect-production.up.railway.app/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2025-12-08T...",
  "environment": "production"
}
```

### Frontend

1. Ouvrez `https://aet-connect.vercel.app`
2. Vérifiez que la connexion fonctionne
3. Vérifiez que les appels API fonctionnent (ouvrir la console du navigateur)

---

## 🐛 Dépannage

### Erreur 404 sur les endpoints API

**Symptôme** : Les requêtes vers `/api/dashboard/stats`, `/api/users`, etc. retournent 404

**Solution** :
1. Vérifiez que `NEXT_PUBLIC_API_URL` est bien configuré sur Vercel
2. Vérifiez que l'URL ne contient **pas** de `/api` à la fin
3. Vérifiez que le backend Railway est bien démarré

### Erreur CORS

**Symptôme** : Erreurs CORS dans la console du navigateur

**Solution** :
1. Vérifiez que `FRONTEND_URL` sur Railway correspond exactement à l'URL Vercel
2. Vérifiez que `credentials: true` est bien configuré dans le backend

### Erreur "Cannot find module '@/config/environment'"

**Symptôme** : Le backend crash au démarrage sur Railway

**Solution** :
1. Vérifiez que le build passe (`npm run build`)
2. Vérifiez que `tsc-alias` est bien exécuté après `tsc`
3. Vérifiez que le script `build` dans `package.json` contient `tsc && tsc-alias`

---

## 📝 Checklist de déploiement

### Backend (Railway)
- [ ] Projet créé sur Railway
- [ ] Variables d'environnement configurées
- [ ] `FRONTEND_URL` pointe vers l'URL Vercel
- [ ] Build réussi
- [ ] Endpoint `/health` répond

### Frontend (Vercel)
- [ ] Projet créé sur Vercel
- [ ] Variables d'environnement configurées
- [ ] `NEXT_PUBLIC_API_URL` pointe vers l'URL Railway
- [ ] Build réussi
- [ ] Application accessible
- [ ] Connexion fonctionne
- [ ] Appels API fonctionnent (vérifier la console)

---

## 🔄 Mise à jour

Pour mettre à jour l'application :

1. **Backend** : Push sur `main` → Railway déploie automatiquement
2. **Frontend** : Push sur `main` → Vercel déploie automatiquement

---

## 📞 Support

En cas de problème, vérifiez :
- Les logs Railway (onglet **Deployments**)
- Les logs Vercel (onglet **Deployments**)
- La console du navigateur (F12)
- Les variables d'environnement dans Railway et Vercel



