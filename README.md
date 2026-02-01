# Cohérence Cardiaque 🫁

Application web professionnelle de cohérence cardiaque avec interface zen et apaisante.

**✨ Version PWA - Installable sur iPhone comme une vraie application !**

## 🌟 Fonctionnalités

- **Séances personnalisables** : Durée ajustable (1-30 minutes)
- **Rythme respiratoire configurable** : Temps d'inspiration et d'expiration personnalisables
- **Sons de respiration** :
  - 4 sons de cloches synthétisés (Tibétaine, Cristal, Bol Chantant, Carillon)
  - Import de sons personnalisés (MP3, WAV, etc.)
  - Contrôle de volume indépendant pour inspiration et expiration
- **Bibliothèque musicale** : Ajoutez plusieurs musiques de fond
- **Animations fluides** : Cercle de respiration guidé visuellement
- **Statistiques en temps réel** : Cycles, respirations, progression
- **💾 Sauvegarde automatique** : Vos préférences sont mémorisées
- **📱 Mode hors ligne** : Fonctionne sans connexion internet
- **🏠 Installable** : Ajoutez-la à votre écran d'accueil iPhone
- **Design responsive** : Fonctionne sur desktop, tablette et mobile
- **Compatible iOS** : Optimisé pour Safari iPhone/iPad

## 📱 Installation sur iPhone

**Guide complet : [INSTALLATION.md](INSTALLATION.md)**

### Rapide :
1. Hébergez l'app sur GitHub Pages / Netlify
2. Ouvrez avec Safari sur iPhone
3. Partagez → "Sur l'écran d'accueil"
4. Profitez ! 🎉

## 📁 Structure du projet

```
coherence-cardiaque/
├── index.html              # Page principale
├── css/
│   └── style.css          # Styles de l'application
├── js/
│   └── app.js             # Logique de l'application
├── sounds/
│   ├── inhale/            # Placez vos sons d'inspiration ici (*.mp3, *.wav)
│   └── exhale/            # Placez vos sons d'expiration ici (*.mp3, *.wav)
├── music/                 # Placez vos musiques d'ambiance ici (*.mp3)
└── README.md              # Ce fichier
```

## 🚀 Utilisation

### Installation

1. Clonez ce repository :
```bash
git clone https://github.com/votre-username/coherence-cardiaque.git
cd coherence-cardiaque
```

2. Ajoutez vos fichiers audio (optionnel) :
   - Sons d'inspiration → dossier `sounds/inhale/`
   - Sons d'expiration → dossier `sounds/exhale/`
   - Musiques de fond → dossier `music/`

3. Ouvrez `index.html` dans votre navigateur

### Utilisation en local

Aucun serveur n'est nécessaire pour l'utilisation basique. Ouvrez simplement `index.html` dans votre navigateur.

Pour un développement avec rechargement automatique, vous pouvez utiliser :

```bash
# Avec Python 3
python -m http.server 8000

# Avec Node.js (npx)
npx serve

# Avec PHP
php -S localhost:8000
```

Puis accédez à `http://localhost:8000`

## 🎨 Personnalisation

### Ajouter des sons personnalisés

Les dossiers `sounds/inhale/` et `sounds/exhale/` sont prévus pour accueillir vos fichiers audio. Les formats supportés sont : MP3, WAV, OGG, etc.

**Note** : Pour l'instant, l'upload se fait via l'interface. Les dossiers sont prévus pour une future fonctionnalité de chargement automatique.

### Ajouter des musiques

Le dossier `music/` est prévu pour stocker vos musiques d'ambiance. Vous pouvez pour l'instant les ajouter via l'interface de l'application.

### Modifier les couleurs

Les couleurs sont définies dans `css/style.css` via des variables CSS :

```css
:root {
    --primary: #2d4654;    /* Couleur principale */
    --secondary: #7fa99b;  /* Couleur secondaire */
    --accent: #e8d5b5;     /* Couleur d'accent */
    --light: #f5f1e8;      /* Fond clair */
}
```

## 🎯 Guide d'utilisation

1. **Configurez votre séance** :
   - Durée souhaitée
   - Temps d'inspiration et d'expiration

2. **Choisissez vos sons** :
   - Sons de cloche intégrés ou personnalisés
   - Ajustez les volumes

3. **Ajoutez une musique** (optionnel) :
   - Uploadez un ou plusieurs fichiers MP3
   - Sélectionnez celle que vous voulez utiliser

4. **Cliquez sur "Commencer"** et laissez-vous guider !

## 📱 Compatibilité

- ✅ Chrome (desktop & mobile)
- ✅ Safari (desktop & iOS)
- ✅ Firefox
- ✅ Edge

**Optimisations iOS** :
- Support des safe-area pour iPhone X et plus récents
- Gestion de l'autoplay audio
- Responsive adapté aux petits écrans

## 🛠️ Technologies utilisées

- HTML5
- CSS3 (Grid, Flexbox, Animations, Variables CSS)
- JavaScript Vanilla (ES6+)
- Web Audio API (synthèse sonore)
- HTML5 Audio API (lecture fichiers)

## 📄 Licence

Ce projet est libre d'utilisation. N'hésitez pas à le fork, le modifier et le partager !

## 🤝 Contributions

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ouvrir une issue pour signaler un bug
- Proposer des améliorations
- Soumettre une pull request

## 👨‍💻 Auteur

Créé avec ❤️ pour promouvoir le bien-être et la cohérence cardiaque

## 🙏 Remerciements

Merci à tous ceux qui pratiquent et promeuvent la cohérence cardiaque pour ses bienfaits sur la santé mentale et physique.

---

**Bonne pratique ! 🧘‍♂️**
