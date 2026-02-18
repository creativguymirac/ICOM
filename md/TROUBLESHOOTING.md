# Problèmes Courants et Solutions

## ❌ "Cannot find module 'express'"

**Cause:** Les dépendances ne sont pas installées

**Solution:**
```bash
npm install
```

---

## ❌ "Error: Invalid login: 535-5.7.8"

**Cause:** App Password Gmail incorrect

**Solution:**
1. Aller sur https://myaccount.google.com/apppasswords
2. Vérifier que vous avez sélectionné "Mail" et votre OS
3. Copier le mot de passe complet (16 caractères)
4. Mettre à jour `.env` avec le nouveau `EMAIL_PASSWORD`
5. Relancer le serveur

**Astuce:** Vérifier que 2FA est activé (https://accounts.google.com/)

---

## ❌ "CORS error: Cross-Origin Request Blocked"

**Cause:** Le frontend n'est pas autorisé par le CORS du backend

**Solution:**

Mettre à jour `FRONTEND_URL` dans `.env`:
```env
# Si vous testez localement
FRONTEND_URL=http://localhost:3000

# Si en production
FRONTEND_URL=https://studio-icom.com,https://www.studio-icom.com
```

Puis relancer le serveur.

---

## ❌ "connect ECONNREFUSED 127.0.0.1:3001"

**Cause:** Le backend n'est pas démarré

**Solution:**
```bash
# Terminal 1: Démarrer le backend
cd backend
npm run dev

# Terminal 2: Test (une fois le serveur prêt)
curl http://localhost:3001/health
```

---

## ❌ "L'email n'est pas reçu"

**Checklist:**

1. ✓ Vérifier que le serveur log "✓ Email envoyé avec succès"
2. ✓ Vérifier le dossier **SPAM** de Gmail
3. ✓ Vérifier que `EMAIL_USER` est correct dans `.env`
4. ✓ Vérifier que le bot est activé dans Gmail settings:
   - https://security.google.com/settings/security/lesssecureapps
5. ✓ Vérifier que le formulaire envoie bien les données:
   ```javascript
   // Dans script.js, ajouter un console.log
   console.log('Données envoyées:', formData);
   ```

---

## ❌ "TypeError: Cannot read property 'querySelector'"

**Cause:** Le formulaire n'existe pas en DOM

**Solution:**
1. S'assurer que le HTML contient `<form id="contactForm">`
2. S'assurer que le script.js est chargé **après** le HTML
3. Vérifier la console du navigateur pour les erreurs JavaScript

---

## ❌ "ValidationError: email is not a valid email"

**Cause:** Email fourni ne respecte pas le format

**Solution valide:**
```
✓ jean@example.com
✓ jean.dupont@example.com
✓ jean+tag@example.com
✗ jean@
✗ @example.com
✗ jean@example (pas de TLD)
```

---

## ❌ "504 Gateway Timeout"

**Cause:** Le serveur SMTP prend trop de temps ou est down

**Solution:**
1. Vérifier la connexion Gmail:
   ```bash
   # Test depuis terminal
   telnet smtp.gmail.com 587
   ```
2. Vérifier les logs du serveur
3. Relancer le backend
4. Vérifier qu'il y a assez d'espace disque (hosters gratuits ont des limites)

---

## ❌ "SyntaxError: JSON.parse"

**Cause:** Les données ne sont pas du JSON valide

**Solution:**
1. Vérifier que `Content-Type: application/json` est défini
2. Vérifier que les guillemets sont corrects:
   ```javascript
   // ✓ Correct
   {"nom": "Test"}
   
   // ✗ Incorrect
   {nom: "Test"}
   ```

---

## ⚠️ Tests de Sécurité Échoués

Si vous testez avec `<script>alert('XSS')</script>`, l'API devrait **rejeter** avec "caractères non valides".

C'est normal et c'est la protection XSS qui fonctionne! ✅

---

## 🔧 Debugging

### Mode Verbose

Dans `server.js`, ajouter:
```javascript
// Avant de démarrer le serveur
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

### Logs Email

Voir ce que Nodemailer envoie:
```javascript
transporter.set('logger', true);
transporter.set('debug', true);
```

### Vérifier les Variables d'Environnement

```bash
# Windows PowerShell
echo $env:EMAIL_USER

# macOS/Linux
echo $EMAIL_USER
```

---

## 📱 Test Mobile

Assurez-vous que le serveur écoute sur `0.0.0.0` au lieu de `localhost`:

```javascript
// server.js
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur sur http://0.0.0.0:${PORT}`);
});
```

Accéder depuis le mobile:
```
http://192.168.x.x:3001/health
```

---

## 🆘 Rapport d'Erreur

Si vous rencontrez une erreur non listée, fournir:

1. **Message d'erreur complet**
2. **Logs du serveur** (sortie terminal)
3. **Logs du navigateur** (console F12)
4. **Contenu du `.env`** (sans secrets!)
5. **Version de Node**
   ```bash
   node --version
   npm --version
   ```

---

**Besoin d'aide?** Relire README.md et SECURITY.md! 📚
