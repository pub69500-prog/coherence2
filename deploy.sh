#!/bin/bash
# Script de déploiement rapide sur GitHub

echo "🚀 Déploiement de Cohérence Cardiaque PWA"
echo ""

# Vérifier si git est initialisé
if [ ! -d ".git" ]; then
    echo "📦 Initialisation du repository Git..."
    git init
    git branch -M main
fi

echo "📝 Ajout des fichiers..."
git add .

echo "💬 Commit des changements..."
git commit -m "🎉 Deploy PWA - Cohérence Cardiaque"

echo ""
echo "✅ Prêt pour le push !"
echo ""
echo "Prochaines étapes :"
echo "1. Créez un repository sur GitHub"
echo "2. Exécutez : git remote add origin https://github.com/VOTRE-USERNAME/coherence-cardiaque.git"
echo "3. Exécutez : git push -u origin main"
echo "4. Activez GitHub Pages dans Settings → Pages"
echo ""
echo "📱 Votre app sera accessible à : https://VOTRE-USERNAME.github.io/coherence-cardiaque"
