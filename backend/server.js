import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import nodemailer from 'nodemailer';

dotenv.config();


const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE DE SÉCURITÉ
// ============================================

// Helmet pour sécuriser les headers HTTP
app.use(helmet());

// CORS - Limitez à votre domaine
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || ['http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['POST'],
  allowedHeaders: ['Content-Type']
}));

// Auth basic (optionnel mais recommandé)
const clientSecret = process.env.CLIENT_SECRET || 'changez-moi-en-production';

// Parsing JSON avec limite de taille
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ============================================
// CONFIGURATION NODEMAILER
// ============================================

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Vérifier la connexion au serveur SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erreur de configuration email:', error);
  } else {
    console.log('✓ Serveur email est prêt');
  }
});

// ============================================
// VALIDATION ET SANITIZATION
// ============================================

// Fonction utilitaire pour nettoyer les inputs
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    // Supprimer les caractères de contrôle
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Limiter la longueur
    .slice(0, 500);
};

// Fonction pour valider le domaine email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Fonction pour valider le numéro de téléphone
const isValidPhone = (phone) => {
  // Accepter les numéros avec +, -, espaces et chiffres (8-15 chiffres)
  const phoneRegex = /^[\d\s\-\+\.()]{8,20}$/;
  return phoneRegex.test(phone);
};

// ============================================
// ROUTES
// ============================================

// Route de test
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Route pour envoyer le formulaire de contact
app.post('/api/contact', [
  // Validation avec express-validator
  body('nom')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le nom doit avoir entre 2 et 100 caractères')
    .matches(/^[a-zA-Z\s\-'àâäéèêëïîôöùûüœæ]+$/).withMessage('Le nom contient des caractères non valides'),
  
  body('prenom')
    .trim()
    .notEmpty().withMessage('Le prénom est requis')
    .isLength({ min: 2, max: 100 }).withMessage('Le prénom doit avoir entre 2 et 100 caractères')
    .matches(/^[a-zA-Z\s\-'àâäéèêëïîôöùûüœæ]+$/).withMessage('Le prénom contient des caractères non valides'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('L\'email est requis')
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('telephone')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidPhone(value)) {
        throw new Error('Format de téléphone invalide');
      }
      return true;
    }),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Le message est requis')
    .isLength({ min: 10, max: 5000 }).withMessage('Le message doit avoir entre 10 et 5000 caractères')
    .escape() // Échappe les caractères HTML/JS
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array().map(e => ({ field: e.param, message: e.msg }))
      });
    }

    const { nom, prenom, email, telephone, message } = req.body;

    // Sanitization supplémentaire
    const nomSanitized = sanitizeInput(nom);
    const prenomSanitized = sanitizeInput(prenom);
    const emailSanitized = email.toLowerCase();
    const phoneSanitized = telephone ? sanitizeInput(telephone) : '';
    const messageSanitized = sanitizeInput(message);

    // Vérifications supplémentaires
    if (!isValidEmail(emailSanitized)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email invalide' 
      });
    }

    // Vérifier que le message n'est pas qu'une répétition du même caractère
    const uniqueChars = new Set(messageSanitized.replace(/\s/g, '')).size;
    if (uniqueChars < 3) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le message ne semble pas valide' 
      });
    }

    // Vérifier les limites de requête (protection contre spam)
    // Dans une vraie app, utiliser Redis ou une DB pour tracker les IPs
    const senderIP = req.ip || req.connection.remoteAddress;
    console.log(`📨 Formulaire reçu de ${senderIP}`);

    // Préparer l'email HTML sécurisé
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .header { background-color: #f4f4f4; padding: 15px; border-radius: 3px; margin-bottom: 20px; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #555; }
            .field-value { color: #333; margin-top: 5px; white-space: pre-wrap; word-wrap: break-word; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Nouveau message du formulaire Studio Icom</h2>
            </div>
            
            <div class="field">
              <div class="field-label">Nom:</div>
              <div class="field-value">${nomSanitized}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Prénom:</div>
              <div class="field-value">${prenomSanitized}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Email:</div>
              <div class="field-value"><a href="mailto:${emailSanitized}">${emailSanitized}</a></div>
            </div>
            
            ${phoneSanitized ? `
            <div class="field">
              <div class="field-label">Téléphone:</div>
              <div class="field-value">${phoneSanitized}</div>
            </div>
            ` : ''}
            
            <div class="field">
              <div class="field-label">Message:</div>
              <div class="field-value">${messageSanitized}</div>
            </div>
            
            <div class="footer">
              <p>Message envoyé le ${new Date().toLocaleString('fr-FR')}</p>
              <p>Adresse IP pour modération: ${senderIP}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Options d'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Email du studio
      replyTo: emailSanitized, // Pour répondre directement au client
      subject: `Nouveau contact - ${prenomSanitized} ${nomSanitized}`,
      html: htmlContent,
      text: `
Nom: ${nomSanitized}
Prénom: ${prenomSanitized}
Email: ${emailSanitized}
Téléphone: ${phoneSanitized || 'Non fourni'}
Message: ${messageSanitized}
      `
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    console.log(`✓ Email envoyé avec succès`);

    // Répondre au client
    return res.status(200).json({ 
      success: true, 
      message: 'Votre message a été envoyé avec succès. Nous vous recontacterons bientôt.' 
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi:', error.message);
    
    // Ne pas révéler les détails d'erreur au client
    return res.status(500).json({ 
      success: false, 
      message: 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer plus tard.' 
    });
  }
});

// ============================================
// GESTION DES ERREURS
// ============================================

// Route 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route non trouvée' });
});

// Middleware erreur global
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Erreur interne du serveur' 
  });
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📧 Email configuré: ${process.env.EMAIL_USER}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
