# Backend de Formulaire de Contact - Studio Icom

## 🔒 Mesures de Sécurité Implémentées

### 1. **Validation des Inputs**
- ✅ Validation stricte avec `express-validator`
- ✅ Regex pour accepter seulement des caractères valides (caractères accentués français inclus)
- ✅ Limites de longueur (nom/prénom: 100 char, message: 5000 char)
- ✅ Normalisation des emails (lowercasing)

### 2. **Protection XSS (Cross-Site Scripting)**
- ✅ `.escape()` des données pour neutraliser les caractères HTML/JS
- ✅ Messages d'erreur génériques au client (pas de détails techniques)
- ✅ Validation stricte des formats

### 3. **Protection Injection SQL**
- ✅ N'utilise pas de base de données directe (pas de SQL)
- ✅ Nodemailer utilise des requêtes SMTP sécurisées
- ✅ Les données ne sont jamais interpolées directement

### 4. **Protection CSRF (Cross-Site Request Forgery)**
- ✅ CORS configuré (accepte seulement les domaines autorisés)
- ✅ Vérification `Origin` et `Content-Type`
- ✅ Méthode POST uniquement

### 5. **Protection Spam/Rate Limiting**
- ✅ Limite de taille (10MB)
- ✅ Vérification de répétitions excessives (minimum 3 caractères uniques)
- ✅ Logging des IP pour modération future
- ⚠️ À améliorer: Implémenter Redis pour limiter le taux de requêtes par IP

### 6. **Sécurité Serveur**
- ✅ Helmet.js pour sécuriser les headers HTTP
- ✅ Variables d'environnement pour les credentials (non commitées)
- ✅ Gestion d'erreurs sans révéler de détails internes
- ✅ HTTPS recommandé en production

## 📦 Installation

### Prérequis
- Node.js 18+
- Compte Gmail avec [App Password](https://support.google.com/accounts/answer/185833)

### Étapes

1. **Installer les dépendances**
```bash
cd backend
npm install
```

2. **Configurer les variables d'environnement**
```bash
cp .env.example .env
```

Puis éditer `.env`:
```env
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-app-password-gmail

PORT=3001
NODE_ENV=production

FRONTEND_URL=http://localhost:3000
```

### Obtenir un App Password Gmail
1. Aller sur https://myaccount.google.com/apppasswords
2. Sélectionner "Mail" et "Windows Computer" (ou votre système)
3. Copier le mot de passe généré
4. Coller dans `EMAIL_PASSWORD` du fichier `.env`

3. **Démarrer le serveur**
```bash
# Développement avec auto-reload
npm run dev

# Production
npm start
```

Le serveur démarre sur `http://localhost:3001`

## 🧪 Test de l'API

### Endpoint: `POST /api/contact`

**Request:**
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean@example.com",
    "telephone": "+33 6 12 34 56 78",
    "message": "Bonjour, j'\''aimerais vous contacter pour un projet web..."
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Votre message a été envoyé avec succès. Nous vous recontacterons bientôt."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    }
  ]
}
```

## 🌐 Configuration Frontend

Le formulaire envoie automatiquement les données via AJAX à `POST /api/contact`. 

**IMPORTANT**: Mettre à jour l'URL de l'API si le backend n'est pas au même endroit que le frontend.

Dans `script.js`, modifier si nécessaire:
```javascript
const response = await fetch('http://votre-api.com/api/contact', {
```

## 📋 Validation des Champs

| Champ | Règle |
|-------|-------|
| **Nom** | 2-100 caractères, lettres + accents |
| **Prénom** | 2-100 caractères, lettres + accents |
| **Email** | Format email valide, max 254 char |
| **Téléphone** | Optionnel, 8-20 caractères |
| **Message** | 10-5000 caractères, min 3 caractères uniques |

## 🔐 Bonnes Pratiques en Production

1. **Utiliser HTTPS**
   - Générer un certificat SSL/TLS
   - Rediriger HTTP → HTTPS

2. **Rate Limiting Avancé**
   - Installer `express-rate-limit`
   - Limiter à 5 requêtes par IP par heure

3. **Base de Données**
   - Sauvegarder les messages reçus
   - Exemple: MongoDB, PostgreSQL

4. **Monitoring**
   - Ajouter `winston` ou `pino` pour les logs
   - Surveiller les erreurs SMTP

5. **Déploiement**
   - Utiliser PM2 pour relancer le serveur automatiquement
   - Exemple: `pm2 start server.js --name "icom-contact"`

## ⚠️ À NE PAS FAIRE

❌ Ne pas committer le fichier `.env` (ajouter à `.gitignore`)
❌ Ne pas utiliser de mots de passe Gmail directement (utiliser App Passwords)
❌ Ne pas ignorer les erreurs SMTP
❌ Ne pas réduire les validations
❌ Ne pas exposer les stack traces au frontend

## 🐛 Troubleshooting

### "Error: Invalid login: 535..."
→ L'App Password est incorrect

### "CORS error"
→ Vérifier `FRONTEND_URL` dans `.env`

### "Cannot find module 'express'"
→ Exécuter `npm install`

### Les emails ne sont pas reçus
→ Vérifier le dossier Spam/Promotions
→ Vérifier que le serveur SMTP démarre sans erreur (`✓ Serveur email est prêt`)

## 📧 Format de l'Email Reçu

L'email reçu par le studio contient:
- Nom et Prénom du contact
- Email (avec lien `mailto:`)
- Téléphone (si fourni)
- Message en texte brut et HTML
- Timestamp d'envoi
- IP du client pour modération

---

**🚀 Système prêt pour la production!**
