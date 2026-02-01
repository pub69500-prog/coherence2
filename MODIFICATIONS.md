# Modifications apportées à l'application Cohérence Cardiaque

## 📋 Résumé des modifications

Cette version optimisée de l'application intègre les améliorations suivantes pour une expérience utilisateur parfaite, particulièrement sur iPhone :

## ✨ Nouvelles fonctionnalités

### 1. Sons de respiration par défaut pré-configurés

- **Son d'inspiration** : `cloche.mp3` (situé dans `sounds/inhale/`)
- **Son d'expiration** : `bol.mp3` (situé dans `sounds/exhale/`)
- Les sons sont automatiquement pré-sélectionnés au premier lancement
- Volume par défaut réglé à 70% pour les deux sons

### 2. Musique d'ambiance intégrée

- **Musique par défaut** : `Music1.mp3` (situé dans `music/`)
- Affichage automatique dans le menu déroulant de la bibliothèque musicale
- Sélection automatique de la première musique disponible
- Volume par défaut réglé à 30%
- Interface de contrôle du volume dédiée

### 3. Compatibilité iPhone optimisée

#### Audio en arrière-plan et écran verrouillé
- ✅ Wake Lock API pour maintenir l'écran actif durant la session
- ✅ Audio silencieux en boucle pour maintenir le contexte audio iOS actif
- ✅ Synchronisation parfaite entre les trois types de sons :
  - Son d'inspiration (synchronisé avec le cycle respiratoire)
  - Son d'expiration (synchronisé avec le cycle respiratoire)
  - Musique d'ambiance (lecture continue)

#### Préchargement des sons
- Les sons de respiration sont préchargés au démarrage
- Rechargement automatique lors du changement de sélection
- Amélioration de la réactivité et élimination des latences

### 4. Contrôles de volume individuels

Chaque type de son dispose de son propre contrôle de volume :
- 🔉 Volume son d'inspiration (slider 0-100%)
- 🔉 Volume son d'expiration (slider 0-100%)
- 🎵 Volume musique d'ambiance (slider 0-100%)

### 5. Nettoyage du code

- Suppression de tous les fichiers système Mac (`.DS_Store`, `._*`, `__MACOSX`)
- Mise à jour du fichier `audio-manifest.json` avec uniquement les fichiers réellement présents
- Code optimisé pour les performances iOS

## 🔧 Fichiers modifiés

### `/assets/audio-manifest.json`
- Mis à jour avec les fichiers audio réellement présents
- Structure simplifiée et cohérente

### `/js/app.js`
- Ajout de la fonction `preloadBreathSounds()` pour le préchargement
- Modification de `loadBundledAudioManifest()` pour la pré-sélection automatique
- Modification de `loadSavedPreferences()` pour gérer les nouveaux défauts
- Ajout d'événements de préchargement sur les changements de sélection

### Structure des fichiers audio
```
sounds/
├── inhale/
│   └── cloche.mp3      (son d'inspiration par défaut)
└── exhale/
    └── bol.mp3         (son d'expiration par défaut)

music/
└── Music1.mp3          (musique d'ambiance par défaut)
```

## 📱 Fonctionnement sur iPhone

### Avant le démarrage
1. Les sons sont automatiquement pré-sélectionnés
2. L'utilisateur peut ajuster les volumes individuellement
3. La musique d'ambiance est visible et sélectionnable

### Durant la session
1. **Wake Lock** maintient l'écran actif
2. **Audio silencieux** en boucle maintient le contexte audio iOS actif
3. Les sons de respiration jouent exactement au moment de chaque transition (inspiration/expiration)
4. La musique d'ambiance joue en continu
5. Tous les sons restent synchronisés même écran verrouillé

### Fin de session
1. Fondu progressif de la musique (5 secondes)
2. Arrêt de l'audio silencieux
3. Libération du Wake Lock

## 🎯 Synchronisation respiratoire

Le rythme des sons d'inspiration et d'expiration est parfaitement coordonné avec :
- Le temps d'inspiration sélectionné (3-10 secondes)
- Le temps d'expiration sélectionné (3-10 secondes)
- Les animations visuelles du cercle de respiration

## 💾 Sauvegarde des préférences

Toutes les préférences sont automatiquement sauvegardées dans le `localStorage` :
- Durée de la séance
- Temps d'inspiration/expiration
- Sons sélectionnés
- Volumes individuels

## 🚀 Installation et utilisation

1. Décompresser l'archive
2. Ouvrir `index.html` dans un navigateur ou déployer sur un serveur web
3. Sur iPhone : ajouter l'application à l'écran d'accueil pour une expérience PWA complète
4. Les sons sont automatiquement configurés - il suffit d'appuyer sur "Commencer"

## ⚙️ Configuration technique

### Formats audio supportés
- MP3 (recommandé pour la compatibilité iOS)
- WAV

### Technologies utilisées
- Web Audio API (pour le contrôle du volume de la musique)
- HTML5 Audio (pour la lecture des sons)
- Wake Lock API (pour maintenir l'écran actif)
- Service Worker (pour la fonctionnalité PWA)
- LocalStorage (pour la persistance des préférences)

## 📝 Notes importantes

- L'application nécessite une interaction utilisateur (toucher/clic) pour débloquer l'audio sur iOS
- Le Wake Lock maintient l'écran actif durant toute la session
- Les sons continuent de jouer même avec l'écran verrouillé grâce à l'audio silencieux
- La musique d'ambiance se termine en fondu pour une expérience plus agréable

---

**Version** : 2.0 - Optimisée pour iPhone  
**Date** : Février 2026  
**Auteur** : Chris
