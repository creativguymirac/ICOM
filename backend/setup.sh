#!/bin/bash

# Script d'installation et de configuration

echo "🚀 Installation du backend Studio Icom"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Installer depuis https://nodejs.org"
    exit 1
fi

echo "✓ Node.js trouvé: $(node --version)"

# Installer les dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erreur lors de l'installation"
    exit 1
fi

echo "✓ Dépendances installées"

# Copier .env.example en .env
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    echo "✓ Fichier .env créé"
    echo "⚠️  IMPORTANT: Éditer .env et ajouter vos credentials Gmail"
    echo "   Email: EMAIL_USER"
    echo "   App Password: EMAIL_PASSWORD"
else
    echo "ℹ️  .env existe déjà"
fi

echo ""
echo "✓ Installation complétée!"
echo ""
echo "📖 Prochaines étapes:"
echo "1. Éditer le fichier .env avec vos identifiants Gmail"
echo "2. Lancer: npm run dev"
echo "3. Tester: curl -X POST http://localhost:3001/api/contact ..."
echo ""
echo "📚 Documentation: voir README.md"
