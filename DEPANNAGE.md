# 🔧 Guide de Dépannage - Cohérence Cardiaque

## ⚠️ Le bouton "Commencer" ne lance rien

### Diagnostic avec la page de debug

1. Ouvrir le fichier **`debug.html`** dans votre navigateur
2. Cliquer sur "Test Sons" et "Test Musique"
3. Vérifier les logs affichés

### Solutions possibles

#### 1. **Ouvrir depuis un serveur web (OBLIGATOIRE)**

Les fichiers audio ne fonctionnent **PAS** en double-cliquant sur `index.html` (protocole `file://`).

**Solution** : Utiliser un serveur web local

**Option A - Python (recommandé)** :
```bash
cd coherence-clean
python3 -m http.server 8000
```
Puis ouvrir : `http://localhost:8000`

**Option B - Node.js** :
```bash
cd coherence-clean
npx http-server -p 8000
```
Puis ouvrir : `http://localhost:8000`

**Option C - VS Code** :
- Installer l'extension "Live Server"
- Clic droit sur `index.html` → "Open with Live Server"

#### 2. **Vérifier la console du navigateur**

1. Appuyer sur **F12** pour ouvrir les outils développeur
2. Aller dans l'onglet **Console**
3. Cliquer sur "Commencer"
4. Vérifier les messages affichés :

**Messages attendus** :
```
🚀 Démarrage de la session...
✅ Sons de respiration déverrouillés
⏱️ Session de 300s démarrée
🎵 Musique d'ambiance démarrée
💨 Démarrage du cycle respiratoire
🔔 Son inspiration joué (volume: 70%)
```

**Messages d'erreur courants** :
- `❌ Erreur chargement cloche: 404` → Le fichier audio n'est pas trouvé
- `❌ Erreur lecture son: NotAllowedError` → L'autoplay est bloqué (normal au premier clic)
- `⚠️ Fichier manifest non trouvé` → Problème de chemin relatif

#### 3. **Autoplay bloqué par le navigateur**

Certains navigateurs bloquent l'autoplay. C'est **normal**.

**Solution** : 
- Cliquer une fois sur "Commencer" pour déverrouiller l'audio
- Si rien ne se passe, cliquer une 2ème fois

#### 4. **Sur iPhone/iPad**

L'audio sur iOS nécessite une **interaction utilisateur** d'abord.

**Procédure** :
1. Cliquer sur "Commencer"
2. Si rien ne se passe, verrouiller puis déverrouiller l'écran
3. Cliquer à nouveau sur "Commencer"

Pour une **installation PWA complète** :
1. Ouvrir dans Safari
2. Appuyer sur le bouton "Partager" (icône carré avec flèche)
3. Sélectionner "Sur l'écran d'accueil"
4. Ouvrir depuis l'icône sur l'écran d'accueil

#### 5. **Vérifier les fichiers audio**

Les fichiers suivants doivent être présents :

```
coherence-clean/
├── sounds/
│   ├── inhale/
│   │   └── cloche.mp3    ← Son d'inspiration
│   └── exhale/
│       └── bol.mp3        ← Son d'expiration
└── music/
    └── Music1.mp3         ← Musique d'ambiance
```

**Test rapide** :
- Essayer de lire les fichiers MP3 directement dans le navigateur
- Si un fichier ne se lit pas → il est corrompu ou manquant

## 🔍 Logs de debug

L'application affiche maintenant des logs détaillés dans la console :

- 🚀 : Initialisation
- ✅ : Succès
- ❌ : Erreur
- ⚠️ : Avertissement
- 🎵 : Musique
- 🔔 : Son inspiration
- 🎺 : Son expiration
- 💨 : Cycle respiratoire

## 📞 Support

Si le problème persiste :

1. Ouvrir `debug.html` depuis un serveur web
2. Copier les logs de la console
3. Noter le navigateur et la version utilisée
4. Partager ces informations

## ✅ Checklist de vérification

- [ ] Fichiers ouverts depuis un serveur web (pas `file://`)
- [ ] Console ouverte (F12) pour voir les logs
- [ ] Fichiers MP3 présents dans les bons répertoires
- [ ] Sur iPhone : installation PWA depuis Safari
- [ ] Premier clic pour déverrouiller l'audio
- [ ] Volume du système > 0%
