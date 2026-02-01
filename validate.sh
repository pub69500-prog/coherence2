#!/bin/bash
# Script de vérification de l'intégrité de la PWA

echo "🔍 Vérification de l'intégrité de la PWA Cohérence Cardiaque"
echo "=============================================================="
echo ""

# Compteur d'erreurs
ERRORS=0

# Vérifier les fichiers essentiels
echo "📁 Vérification des fichiers..."
FILES=(
    "index.html"
    "manifest.json"
    "sw.js"
    "css/style.css"
    "js/app.js"
    "icons/icon-192x192.png"
    "icons/icon-512x512.png"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file MANQUANT"
        ((ERRORS++))
    fi
done

echo ""
echo "🔧 Vérification de la syntaxe..."

# Vérifier JSON
if python3 -m json.tool manifest.json > /dev/null 2>&1; then
    echo "  ✅ manifest.json valide"
else
    echo "  ❌ manifest.json invalide"
    ((ERRORS++))
fi

# Vérifier JavaScript
if node -c js/app.js > /dev/null 2>&1; then
    echo "  ✅ js/app.js syntaxe valide"
else
    echo "  ❌ js/app.js erreur de syntaxe"
    ((ERRORS++))
fi

if node -c sw.js > /dev/null 2>&1; then
    echo "  ✅ sw.js syntaxe valide"
else
    echo "  ❌ sw.js erreur de syntaxe"
    ((ERRORS++))
fi

echo ""
echo "🔍 Vérification du contenu..."

# Vérifier que le manifest est référencé dans index.html
if grep -q 'rel="manifest"' index.html; then
    echo "  ✅ Manifest lié dans index.html"
else
    echo "  ❌ Manifest non lié dans index.html"
    ((ERRORS++))
fi

# Vérifier que le Service Worker est enregistré
if grep -q 'serviceWorker.register' index.html; then
    echo "  ✅ Service Worker enregistré"
else
    echo "  ❌ Service Worker non enregistré"
    ((ERRORS++))
fi

# Vérifier les fonctions localStorage
if grep -q 'localStorage.setItem' js/app.js; then
    echo "  ✅ localStorage implémenté"
else
    echo "  ⚠️  localStorage non trouvé (optionnel)"
fi

# Vérifier les icônes
if [ -f "icons/icon-192x192.png" ] && [ -f "icons/icon-512x512.png" ]; then
    SIZE_192=$(wc -c < "icons/icon-192x192.png")
    SIZE_512=$(wc -c < "icons/icon-512x512.png")
    if [ $SIZE_192 -gt 100 ] && [ $SIZE_512 -gt 100 ]; then
        echo "  ✅ Icônes générées correctement"
    else
        echo "  ❌ Icônes trop petites (corrompues?)"
        ((ERRORS++))
    fi
fi

echo ""
echo "=============================================================="

if [ $ERRORS -eq 0 ]; then
    echo "✅ VALIDATION RÉUSSIE - L'application est prête !"
    echo ""
    echo "🚀 Prochaines étapes :"
    echo "   1. Déployer sur Netlify ou GitHub Pages"
    echo "   2. Ouvrir dans Safari sur iPhone"
    echo "   3. Ajouter à l'écran d'accueil"
    echo ""
    echo "📖 Voir INSTALLATION.md pour le guide complet"
else
    echo "❌ $ERRORS ERREUR(S) DÉTECTÉE(S)"
    echo ""
    echo "⚠️  Corrigez les erreurs ci-dessus avant de déployer"
fi

exit $ERRORS
