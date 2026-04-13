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

Dans Railway, allez dans **Variables** et ajoutez :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

# JWT
JWT_SECRET=votre-secret-jwt-securise

# Frontend URL (URL de votre frontend Vercel)
FRONTEND_URL=https://aet-connect.vercel.app

# Port (Railway gère automatiquement)
PORT=3001

# Environment
NODE_ENV=production
```

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

Dans Vercel, allez dans **Settings > Environment Variables** et ajoutez :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key

# Backend API URL (URL Railway du backend)
NEXT_PUBLIC_API_URL=https://aet-connect-production.up.railway.app
```

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



