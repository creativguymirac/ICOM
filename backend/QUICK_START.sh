#!/usr/bin/env node

# 🚀 QUICK START - 30 secondes!

echo "📦 Installation des dépendances..."
npm install

echo ""
echo "📝 Configuration de Gmail..."
echo ""
echo "1. Aller sur: https://myaccount.google.com/apppasswords"
echo "2. Sélectionner: Mail + votre système"
echo "3. Copier le mot de passe (16 caractères)"
echo ""

read -p "Entrez votre email Gmail: " email_user
read -sp "Entrez l'App Password: " email_password

# Créer .env
cat > .env << EOF
EMAIL_USER=$email_user
EMAIL_PASSWORD=$email_password
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
EOF

echo ""
echo "✅ Configuration complétée!"
echo ""
echo "🚀 Démarrer le serveur:"
echo "   npm run dev"
echo ""
echo "🧪 Tester l'API:"
echo "   curl -X POST http://localhost:3001/api/contact -H 'Content-Type: application/json' -d '{\"nom\":\"Test\",\"prenom\":\"User\",\"email\":\"test@example.com\",\"message\":\"Ceci est un message de test pour vérifier que tout fonctionne!\"}'"
echo ""
echo "📖 Documentation complète dans README.md"
