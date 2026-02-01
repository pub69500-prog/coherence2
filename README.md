# Cohérence Cardiaque - Application Optimisée

## 🎯 Modifications apportées

Cette version de l'application a été nettoyée et optimisée selon les spécifications suivantes :

### 1. Sons de respiration pré-sélectionnés
- **Inspiration** : Son de cloche (`sounds/inhale/cloche.mp3`)
- **Expiration** : Son de bol tibétain (`sounds/exhale/bol.mp3`)
- Ces sons sont fixes et ne peuvent pas être changés
- Seul le **volume** de chaque son est réglable par l'utilisateur

### 2. Musique d'ambiance par défaut
- **Musique intégrée** : `Music1.mp3` dans le répertoire `music/`
- Chargement **automatique** au démarrage de l'application
- Affichage dans un **menu déroulant** (extensible si plusieurs musiques sont ajoutées)
- Volume réglable indépendamment

### 3. Compatibilité iPhone écran verrouillé
- ✅ Wake Lock pour empêcher la mise en veille
- ✅ Audio silencieux en arrière-plan pour iOS
- ✅ Les 3 sons (inspiration, expiration, musique) continuent même écran verrouillé
- ✅ Synchronisation parfaite maintenue

### 4. Synchronisation des sons
- Les sons d'inspiration et d'expiration sont **parfaitement synchronisés** avec le rythme respiratoire sélectionné
- Le minutage s'adapte automatiquement aux durées configurées (3 à 10 secondes)

### 5. Nettoyage effectué
- ❌ Supprimés : tous les fichiers de documentation (.md)
- ❌ Supprimés : scripts de test et validation
- ❌ Supprimé : upload de fichiers audio personnalisés
- ✅ Conservés : uniquement les fichiers essentiels au fonctionnement

## 📁 Structure de l'application

```
coherence-clean/
├── index.html              # Page principale
├── manifest.json           # Manifest PWA
├── sw.js                   # Service Worker
├── assets/
│   └── audio-manifest.json # Manifest des musiques
├── css/
│   └── style.css          # Styles
├── js/
│   └── app.js             # Logique de l'application
├── icons/
│   ├── icon-192x192.png   # Icône PWA
│   └── icon-512x512.png   # Icône PWA
├── music/
│   └── Music1.mp3         # Musique d'ambiance par défaut
└── sounds/
    ├── inhale/
    │   └── cloche.mp3     # Son d'inspiration (fixe)
    └── exhale/
        └── bol.mp3        # Son d'expiration (fixe)
```

## 🚀 Utilisation

1. **Ouvrir l'application** : Double-cliquer sur `index.html` ou héberger sur un serveur web
2. **Sur iPhone** : Ajouter à l'écran d'accueil pour l'expérience PWA complète
3. **Réglages disponibles** :
   - Durée de la séance (1-30 minutes)
   - Rythme respiratoire (inspiration et expiration de 3 à 10 secondes)
   - Volume des sons d'inspiration et d'expiration
   - Volume de la musique d'ambiance
4. **Commencer** : Cliquer sur "Commencer" pour démarrer la séance

## 🎵 Ajouter d'autres musiques

Pour ajouter d'autres musiques d'ambiance :

1. Placer les fichiers MP3 dans le répertoire `music/`
2. Mettre à jour le fichier `assets/audio-manifest.json` :
   ```json
   {
     "music": ["Music1.mp3", "Music2.mp3", "Music3.mp3"]
   }
   ```
3. Les musiques apparaîtront automatiquement dans le menu déroulant

## 📱 Fonctionnalités iOS

- **Écran verrouillé** : L'audio continue de fonctionner
- **PWA** : Installable comme une application native
- **Hors ligne** : Fonctionne sans connexion internet grâce au Service Worker
- **Wake Lock** : Empêche la mise en veille pendant la séance

## 💾 Historique

L'application enregistre automatiquement vos séances terminées et affiche des statistiques :
- Aujourd'hui
- Semaine
- Mois
- Année

---

**Fait avec ❤️ par Chris**
