# 🔐 Documentation Sécurité - Formulaire Contact

## Vue d'ensemble des vulnérabilités et protections

### 1️⃣ XSS (Cross-Site Scripting)

**Risque:** Un attaquant envoie du code JavaScript malveillant dans un champ du formulaire.
```javascript
// ❌ AVANT - VULNÉRABLE
const message = "<img src=x onerror='alert(\"XSS\")'>";
// Le message s'afficherait et exécuterait le code

// ✅ APRÈS - PROTÉGÉ
.escape() // Échappe les caractères: "<" devient "&lt;"
// Résultat: &lt;img src=x onerror='alert(&quot;XSS&quot;)'&gt;
// Le navigateur affiche le texte littéralement, pas d'exécution
```

**Protections implémentées:**
- `.escape()` de express-validator neutralise tous les caractères HTML/JS
- Validation stricte des formats (no regex non-contrôlée)
- Email normalisé (lowercasing)
- Mensages HTML échappés avant envoi

---

### 2️⃣ SQL Injection

**Risque:** Code SQL injecté pour modifier/lire la base de données.
```sql
-- ❌ AVANT - VULNÉRABLE
SELECT * FROM users WHERE email = '' OR '1'='1';
-- Retourne TOUS les utilisateurs

-- ✅ APRÈS - PROTÉGÉ
-- Pas de SQL direct, utilisation de Nodemailer
-- Les données ne sont jamais interpolées en SQL
```

**Protections implémentées:**
- Pas de base de données directe dans ce système
- Nodemailer utilise SMTP (protocole sécurisé)
- Variables d'environnement pour credentials
- Aucune requête directe au serveur

---

### 3️⃣ Email Header Injection

**Risque:** Injection de en-têtes d'email pour envoyer du spam.
```
// ❌ AVANT - VULNÉRABLE
To: victim@example.com
Cc: attacker@evil.com
Subject: ...
```

**Protections implémentées:**
- Nodemailer nettoie automatiquement les en-têtes
- Validation stricte de l'email (format RFC 5322)
- Email utilisateur défini uniquement en `replyTo`
- Destination email en dur dans le code (pas utilisant l'input)

---

### 4️⃣ CSRF (Cross-Site Request Forgery)

**Risque:** Un site malveillant force l'utilisateur à soumettre le formulaire.
```html
<!-- ❌ AVANT - VULNÉRABLE
<img src="https://studio-icom.com/api/contact?email=attacker@evil.com">
-->

<!-- ✅ APRÈS - PROTÉGÉ
- Vérification CORS stricte
- Origin header vérifié
- Content-Type: application/json requis (pas multipart/form-data)
- Method: POST uniquement
-->
```

**Protections implémentées:**
- CORS configuré pour accepter seulement `FRONTEND_URL`
- Helmet.js configure les headers CSRF
- Headers d'options (`X-Frame-Options`, etc.)

---

### 5️⃣ Validation des Données

**Risque:** Données invalides ou malveillantes causent des erreurs/exploits.

**Protections implémentées:**
```javascript
// Nom/Prénom
- Min: 2, Max: 100 caractères
- Regex: /^[a-zA-Z\s\-'àâäéèêëïîôöùûüœæ]+$/
- Accepte: lettres, accents français, tirets, apostrophes
- Refuse: chiffres, caractères spéciaux, emojis

// Email
- Format strict RFC 5322
- Max: 254 caractères (limite RFC)
- Normalisation: lowercasing + trim

// Téléphone
- Format: +33 6 12 34 56 78 ou variations
- Regex: /^[\d\s\-\+\.()]{8,20}$/
- Min: 8, Max: 20 caractères

// Message
- Min: 10, Max: 5000 caractères
- Min 3 caractères UNIQUES (anti-spam: "aaaaa...a")
- Échappe les caractères HTML
```

---

### 6️⃣ Rate Limiting / Spam

**Risque:** Attaquant submerge le serveur de requêtes.

**Protections actuelles:**
- Limite de taille: 10MB
- Vérification de répétition (min 3 caractères uniques)
- Logging des IP

**À ajouter en production:**
```javascript
// Installer: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 requêtes par IP
  message: 'Trop de requêtes, réessayez plus tard'
});

app.post('/api/contact', limiter, [...validations], handler);
```

---

### 7️⃣ Gestion des Erreurs

**Risque:** Afficher des détails techniques révèle la structure du système.

**Protections implémentées:**
```javascript
// ❌ AVANT - FUITE D'INFO
return res.status(500).json({ 
  error: error.message, // "Can't connect to SMTP server on port 587"
  stack: error.stack 
});

// ✅ APRÈS - SÉCURISÉ
return res.status(500).json({ 
  success: false, 
  message: 'Une erreur est survenue lors de l\'envoi.' // Générique
});
// Mais on log l'erreur réelle côté serveur
console.error('❌ Erreur lors de l\'envoi:', error.message);
```

---

### 8️⃣ Variables d'Environnement

**Risque:** Credentials exposées dans le code.

**Protections implémentées:**
```env
# ✅ SÉCURISÉ: .env (non committé)
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=app-password-genere-par-google

# ✅ Utilisé en production sur le serveur, pas en code
// Dans server.js
auth: {
  user: process.env.EMAIL_USER,    // Lis depuis l'environnement
  pass: process.env.EMAIL_PASSWORD
}
```

**.gitignore configure Pour s'assurer que `.env` ne s'engage jamais:**
```
.env
.env.local
.env.production
```

---

### 9️⃣ HTTPS et Transport Secure

**Risque:** Les données transitent en clair sur Internet.

**Protections actuelles:**
- SMTP utilise le port 587 avec TLS
- Variables protégées

**À ajouter en production:**
```javascript
// Rediriger HTTP → HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});

// Ou sur le serveur reverse-proxy (Nginx, Apache)
```

---

### 🔟 Sensitive Data Exposure

**Risque:** Les logs/emails contiennent des données sensibles.

**Protections implémentées:**
```javascript
// Logs contiennent seulement:
console.log(`✓ Email envoyé avec succès`);
console.log(`📨 Formulaire reçu de ${senderIP}`);

// Pas de:
console.log(req.body); // Afficherait l'email/téléphone
console.log(error.message); // Stack trace

// Email reçu est formaté proprement
// Données visibles dans le HTML sent au studio
// IP incluse pour modération (peut être anonymisée)
```

---

## ✅ Checklist de Sécurité

- [x] Validation stricte des inputs
- [x] Regex restrictiffe pour les noms/prénoms
- [x] Normalisation des emails
- [x] Échappement XSS
- [x] CORS configuré
- [x] Helmet.js activé
- [x] Gestion d'erreurs générique
- [x] Variables d'environnement pour secrets
- [x] .gitignore pour .env
- [x] Headers SMTP sécurisés (pas injection d'email)
- [x] Logging des IPs
- [ ] Rate limiting (Redis)
- [ ] HTTPS en production
- [ ] Monitoring/alertes
- [ ] Backups des messages

---

## 🧪 Tests de Sécurité

### Test 1: XSS
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "<img src=x onerror=\"alert(1)\">",
    "prenom": "Test",
    "email": "test@test.com",
    "message": "Message normal"
  }'
```
✅ Expected: Rejet (caractères non valides)

### Test 2: Email Injection
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Test",
    "prenom": "User",
    "email": "attacker@evil.com\nBcc: spam@list.com",
    "message": "Message"
  }'
```
✅ Expected: Email invalide (newline non acceptée)

### Test 3: Message trop court
```bash
curl -X POST http://localhost:3001/api/contact \
  -d '{"nom":"Test","prenom":"Test","email":"test@test.com","message":"Oui"}'
```
✅ Expected: "Le message doit avoir entre 10 et 5000 caractères"

### Test 4: CORS
Tester depuis un autre domaine
```javascript
fetch('http://localhost:3001/api/contact', {...}) // Depuis example.com
```
✅ Expected: Rejet CORS (origin non autorisé)

---

## 📚 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Docs](https://helmetjs.github.io/)
- [Email Security](https://nodemailer.com/smtp/secure/)

---

**🛡️ Système sécurisé et robuste!**
