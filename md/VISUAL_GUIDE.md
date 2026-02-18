# 🎨 Système en Images

## 1. Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                    SITE STUDIO ICOM                         │
│                   (index.html / CSS)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Utilisateur remplit le formulaire de contact      │  │
│  │   [Nom] [Prénom] [Email] [Téléphone] [Message]     │  │
│  │                    [Envoyer]                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                        ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   script.js intercepte le clic du bouton           │  │
│  │   - Valide les données                             │  │
│  │   - Envoie en AJAX vers /api/contact               │  │
│  │   - Affiche notification (succès/erreur)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           ↓
           │
           │ JSON (AJAX)
           │
           ↓
┌─────────────────────────────────────────────────────────────┐
│              SERVEUR BACKEND (Node.js/Express)              │
│                    localhost:3001                           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Étape 1: Valider les données (express-validator)   │  │
│  │ - Email format valide?                             │  │
│  │ - Nom/Prénom au bon format?                        │  │
│  │ - Message au minimum 10 caractères?                │  │
│  └──────────────────────────────────────────────────────┘  │
│                        ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Étape 2: Nettoyer les données (sanitization)       │  │
│  │ - Échapper les caractères HTML (.escape())         │  │
│  │ - Trim les espaces                                 │  │
│  │ - Valider anti-spam                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                        ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Étape 3: Formater l'email HTML                     │  │
│  │ - Template HTML professionnel                       │  │
│  │ - Ajouter l'IP du client pour modération           │  │
│  │ - Ajouter le timestamp                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                        ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Étape 4: Envoyer via Gmail SMTP                    │  │
│  │ - Nodemailer se connecte au serveur Gmail          │  │
│  │ - Envoie l'email formaté                           │  │
│  │ - Retour succès/erreur                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                        ↓                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Répondre au frontend                               │  │
│  │ { success: true, message: "..." }                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           ↓
           │
           │ JSON (Response)
           │
           ↓
┌─────────────────────────────────────────────────────────────┐
│                    SITE STUDIO ICOM                         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   Notification affichée:                            │  │
│  │   ✅ "Votre message a été envoyé!"                 │  │
│  │   ou                                                │  │
│  │   ❌ "Email invalide"                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
           ↓
           │ Et en même temps...
           │
           ↓
┌─────────────────────────────────────────────────────────────┐
│                    INBOX GMAIL                              │
│                   icom.create@gmail.com                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ [De] Jean Dupont <jean@example.com>                │  │
│  │ [Sujet] Nouveau contact - Jean Dupont              │  │
│  │ [Date] 18 fev 2026, 14:32                          │  │
│  │                                                     │  │
│  │ Bonjour,                                           │  │
│  │                                                     │  │
│  │ Nom: Dupont      Prénom: Jean                      │  │
│  │ Email: jean@example.com                            │  │
│  │ Téléphone: +33 6 12 34 56 78                       │  │
│  │                                                     │  │
│  │ Message:                                           │  │
│  │ "Je suis intéressé par vos services..."           │  │
│  │                                                     │  │
│  │ [Répondre directement] ← Click pour répondre      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Sécurité - Protection Contre les Attaques

### ❌ Avant (Vulnérable)
```javascript
// Script Java un attaquant:
Message: <script>alert('XSS!'):</script>

// Résultat: Le code s'exécute ❌
```

### ✅ Après (Protégé)
```javascript
// Script sera converti en texte:
Message: <script>alert('XSS!'):</script>

// Became: &lt;script&gt;alert('XSS!')&lt;/script&gt;
// Résultat: Affiché comme du texte ✅
```

---

## 3. Validation Stricte

```
FORMULAIRE
    ↓
┌─────────────────────────┐
│ Validation HTML5        │ ← Première ligne de défense
│ (type="email", etc.)    │   (côté navigateur)
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Validation JavaScript   │ ← Deuxième ligne de défense
│ (script.js)             │   (avant d'envoyer)
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Validation Backend      │ ← Troisième ligne de défense
│ (express-validator)     │   (la plus importante!)
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Sanitization Démo       │ ← Quatrième ligne de défense
│ (.escape(), regex)      │   (nettoyage supplémentaire)
└─────────────────────────┘
    ↓
✅ Email envoyé!
```

---

## 4. Flux de Données - Vue Détaillée

```
USER INPUT
    │
    ├─ Nom: Jean Dupont
    ├─ Prénom: Marie
    ├─ Email: jean@example.com
    ├─ Téléphone: +33 6 12 34 56 78
    └─ Message: Bonjour, je veux discuter...
    │
    ↓
VALIDATION
    │
    ├─ Nom: ✅ (2-100 chars, lettres + accents)
    ├─ Prénom: ✅ (2-100 chars, lettres + accents)
    ├─ Email: ✅ (format RFC 5322)
    ├─ Téléphone: ✅ (format international)
    └─ Message: ✅ (10-5000 chars)
    │
    ↓
SANITIZATION
    │
    ├─ Nom: trim() → "JeanDupont" (no extra spaces)
    ├─ Prénom: trim() → "Marie"
    ├─ Email: lowercase() → "jean@example.com"
    ├─ Téléphone: clean() → "+33612345678"
    └─ Message: escape() → "(special chars become safe)"
    │
    ↓
ANTI-SPAM
    │
    ├─ Pas de répétition excessive: "aaaa..." → ❌ Rejected
    ├─ Pas tous les mêmes caractères → ✅ OK
    └─ IP loggée pour modération
    │
    ↓
EMAIL FORMATTING
    │
    ├─ HTML valide et bien formaté
    ├─ Pas d'injection de headers
    ├─ Email du client en "replyTo"
    └─ Destination en dur (pas input user)
    │
    ↓
SMTP SEND
    │
    ├─ Connexion Gmail (port 587, TLS)
    ├─ Auth avec credentials
    └─ Envoi de l'email
    │
    ↓
RESPONSE
    │
    ├─ Succès: { success: true, ... }
    └─ Erreur: { success: false, ... }
    │
    ↓
✅ UTILISATEUR VOIT LA NOTIFICATION
```

---

## 5. Checklist de Sécurité Visuelle

```
┌──────────────────────────────────────────────────┐
│        SÉCURITÉ - CHECKLIST                      │
├──────────────────────────────────────────────────┤
│ [✅] Validation des inputs                      │
│ [✅] Échappement XSS                            │
│ [✅] CORS configuré                             │
│ [✅] Helmet.js activé                           │
│ [✅] Rate limiting basique                      │
│ [✅] Variables d'env protégées                  │
│ [✅] Pas de SQL injection                       │
│ [✅] Email header injection prevented           │
│ [✅] Logs sécurisés                             │
│ [⚠️] Rate limiting avancé (TODO)                │
│ [⚠️] HTTPS en production (TODO)                 │
│ [⚠️] Base de données (TODO)                     │
└──────────────────────────────────────────────────┘
```

---

## 6. Cycle de Vie d'une Requête

```
┌─────────────────────────────────────────────────┐
│ 1️⃣  Utilisateur clique "Envoyer"               │
├─────────────────────────────────────────────────┤
│ ↓                                               │
│ 2️⃣  Submit du formulaire                       │
│ ↓                                               │
│ 3️⃣  JavaScript preventDefault()                │
│ ↓                                               │
│ 4️⃣  Validation JavaScript                      │
│ ↓                                               │
│ 5️⃣  fetch() POST /api/contact                  │
│ ↓                                               │
│ 6️⃣  Backend reçoit la requête                 │
│ ↓                                               │
│ 7️⃣  Validation express-validator              │
│ (Si erreur → 400 Bad Request)                  │
│ ↓                                               │
│ 8️⃣  Sanitization et vérifications             │
│ ↓                                               │
│ 9️⃣  Format email et intégrité                 │
│ ↓                                               │
│ 🔟 Nodemailer envoie via SMTP                  │
│ (Si erreur → 500 Internal Server Error)        │
│ ↓                                               │
│ 1️⃣1️⃣ Réponse JSON au frontend                 │
│ ↓                                               │
│ 1️⃣2️⃣ Notification affichée à l'utilisateur    │
│ ↓                                               │
│ 1️⃣3️⃣ Email dans l'inbox du studio             │
└─────────────────────────────────────────────────┘
```

---

## 7. Intégration avec le Site

```
BEFORE:
┌────────────────────────────┐
│ <form action="mailto:..."> │  ← Ouvre le client mail
│   ...                      │     (non-sécurisé)
│   <button>Envoyer</button> │
│ </form>                    │
└────────────────────────────┘

AFTER:
┌──────────────────────────────────────┐
│ <form id="contactForm">              │  ← ID pour JS
│   ...                                │
│   <button>Envoyer</button>           │     (sécurisé)
│ </form>                              │
│                                      │
│ <script>                             │  ← Gère AJAX
│   form.addEventListener('submit'...) │
│   fetch('/api/contact', ...)         │
│   showNotification(...)              │
│ </script>                            │
└──────────────────────────────────────┘
```

---

**🎨 Visualisation complète du système!**
