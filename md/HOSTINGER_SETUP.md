# 🚀 Guide Complet - Déploiement sur Hostinger

## Erreur 503 - Solutions

L'erreur 503 (Service Indisponible) signifie que votre serveur backend ne démarre pas correctement.

### ✅ Checklist de Déploiement

#### 1. **Vérifier que Node.js App est activé**
- [ ] Aller dans **hPanel** → **Node.js App Hosting** (ou Node.js)
- [ ] S'assurer que **Node.js** est disponible
- [ ] Vérifier la version Node.js supportée (min v18.0.0)

#### 2. **Uploader les fichiers**
```bash
# Via Git ou FTP
git clone votre-repertorio backend
cd backend
# OU manuellement via FTP
```

#### 3. **Variables d'Environnement (CRITIQUE)**
Dans **Hostinger hPanel** → **Node.js App** ou **Environment Variables** :

```
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-app-password-16-chars
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://votredomaine.com
```

⚠️ **Important Gmail** :
1. Activez 2FA: https://accounts.google.com/
2. Créez un App Password: https://myaccount.google.com/apppasswords
3. Sélectionnez "Mail" + votre OS
4. Copiez le mot de passe généré (16 caractères exactement)

#### 4. **Installer les dépendances**
Dans le terminal Hostinger ou via Git deployment:

```bash
cd backend
npm install
```

#### 5. **Configurer le point de démarrage**
- **Main File / Entry Point**: `server.js` ou `backend/server.js`
- **Start Command**: `npm start`

#### 6. **Redémarrer l'application**
- Cliquer sur **Restart** dans le dashboard Hostinger
- Attendre 30-60 secondes

---

## 🔍 Déboguer l'Erreur 503

### Via les Logs Hostinger

1. Aller à **hPanel** → **Node.js App**
2. Cliquer sur **Logs** ou **View Logs**
3. Chercher les erreurs liées à :
   - `Cannot find module` → npm install manquant
   - `Error: listen EADDRINUSE` → Port déjà utilisé
   - `Error: ENOENT` → Variables d'environnement manquantes
   - `Gmail authentication failed` → EMAIL_USER ou EMAIL_PASSWORD incorrect

### Terminal Hostinger (SSH)

Si SSH est activé :

```bash
# Se connecter
ssh username@hostinger-server

# Aller au dossier
cd public_html/backend  # ou votre chemin

# Vérifier les variables
echo $EMAIL_USER
echo $NODE_ENV

# Tester le démarrage
npm start

# Voir les erreurs en direct
node server.js
```

---

## 📋 Structure Attendue sur Hostinger

```
public_html/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── node_modules/       ← créé par npm install
│   ├── .env                ← variables d'environnement
│   └── ...
├── index.html              ← frontend (optionnel)
└── ...
```

---

## 🆘 Solutions Rapides

### Problème : "npm: command not found"
- Hostinger n'a pas Node.js activé
- ✅ Solution: Activer Node.js dans **hPanel** → **Node.js App Hosting**

### Problème : "Cannot find module 'express'"
```bash
npm install
npm install --production
```

### Problème : "Email password incorrect"
```bash
# Régénérez l'App Password Gmail
# https://myaccount.google.com/apppasswords
# Assurez-vous d'avoir copié les 16 caractères SANS espaces
```

### Problème : "Port 3001 already in use"
- Hostinger utilise des ports dynamiques
- ✅ Hostinger définira le PORT automatiquement
- Ne pas forcer le PORT

### Problème : "CORS error" ou "403 Forbidden"
Vérifier dans le fichier `.env` :
```env
FRONTEND_URL=https://votredomaine.com,https://www.votredomaine.com
```

---

## ✨ Test Avant Production

### En Local
```bash
cd backend
npm install
node server.js
# Tester: curl http://localhost:3001/
```

### Vérifier que le formulaire fonctionne
- Ouvrir `frontend/index.html` dans le navigateur
- Remplir le formulaire
- Vérifier que l'email arrive

---

## 📞 Support Hostinger

Si rien ne fonctionne :
1. **Chat support 24/7** dans hPanel
2. Demander : "My Node.js app returns 503 error"
3. Partager les logs

---

## Statut du Déploiement ✅

| Étape | Statut |
|-------|--------|
| Domain configuré | ? |
| Node.js activé | ? |
| npm install | ? |
| Variables d'env | ? |
| Server.js fonctionne | ? |
| Email fonctionne | ? |

Mettez à jour ce tableau au fur et à mesure ! 🚀
