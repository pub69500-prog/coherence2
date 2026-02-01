# 🐛 DEBUG iOS - Son s'arrête après première inspiration

## 📱 Test avec Console Safari

**OBLIGATOIRE pour comprendre le problème !**

### 1. Active Web Inspector

**Sur iPhone :**
```
Réglages → Safari → Avancé → Web Inspector : ON
```

**Sur Mac :**
```
Safari → Develop → [Ton iPhone] → coherence-cardiaque
Onglet "Console"
```

### 2. Lance une séance et regarde la console

**Ce que tu DOIS voir :**

```
📦 Création nouvel Audio pour inhale (src: ./sounds/inhale/ton-son.mp3)
✅ Audio inhale chargé et prêt
🔄 Reset son inhale (volume: 0.7, src: https://ton-site.com/sounds/inhale/ton-son.mp3)
✅ Son inhale JOUE maintenant (volume: 0.7)

[Après 5 secondes]

📦 Création nouvel Audio pour exhale (src: ./sounds/exhale/ton-son.mp3)
✅ Audio exhale chargé et prêt
🔄 Reset son exhale (volume: 0.7, src: https://ton-site.com/sounds/exhale/ton-son.mp3)
✅ Son exhale JOUE maintenant (volume: 0.7)

[Après 5 secondes]

🔄 Reset son inhale (volume: 0.7, src: ...)
✅ Son inhale JOUE maintenant (volume: 0.7)
```

### 3. Si tu vois une ERREUR

**Erreur type 1 : NotAllowedError**
```
❌ BLOQUÉ exhale: NotAllowedError The request is not allowed by the user agent
```

**Cause :** iOS bloque l'audio
**Solutions :**
- Désactive le mode silencieux iPhone
- Monte le volume de l'iPhone
- Touche l'écran juste avant de lancer la séance

**Erreur type 2 : Audio Context suspended**
```
Audio Context state: suspended
```

**Cause :** Audio Context iOS en pause
**Solution appliquée :** Le code essaie automatiquement de le reprendre

**Erreur type 3 : Fichier non trouvé**
```
❌ Erreur chargement inhale: net::ERR_FILE_NOT_FOUND
```

**Cause :** MP3 pas sur le serveur
**Solution :** 
- Vérifie que tes MP3 sont bien déployés
- Vérifie le manifest
- Ouvre l'URL directement : `https://ton-site.com/sounds/inhale/ton-son.mp3`

## 🔍 Checklist de dépannage

### Avant de lancer

- [ ] Mode silencieux iPhone : **DÉSACTIVÉ** (interrupteur sur le côté)
- [ ] Volume iPhone : **> 50%**
- [ ] Console Safari : **OUVERTE sur Mac**
- [ ] App ouverte dans Safari (pas Chrome !)

### Pendant la séance

- [ ] Premier son joue ? OUI/NON
- [ ] Console affiche "✅ Son inhale JOUE" ? OUI/NON
- [ ] Après 5s, console affiche "📦 Création exhale" ? OUI/NON
- [ ] Deuxième son joue ? OUI/NON
- [ ] Erreur dans console ? Copie le message EXACT

## 📊 Scénarios possibles

### Scénario A : Fonctionne parfaitement ✅

**Console :**
```
✅ Son inhale JOUE
✅ Son exhale JOUE
✅ Son inhale JOUE
✅ Son exhale JOUE
...
```

**→ Tout est OK ! L'app fonctionne !**

### Scénario B : Premier son OK, deuxième bloqué ❌

**Console :**
```
✅ Son inhale JOUE
❌ BLOQUÉ exhale: NotAllowedError
```

**Causes probables :**
1. Mode silencieux activé
2. iOS a suspendu l'audio
3. Pas assez d'interaction utilisateur

**Solutions :**
1. Désactive mode silencieux
2. Monte volume
3. Touche l'écran avant de lancer

### Scénario C : Aucun son ne joue ❌

**Console :**
```
❌ BLOQUÉ inhale: NotAllowedError
```

**Cause :** Audio complètement bloqué par iOS

**Solution :**
1. Rafraîchis la page
2. Touche l'écran plusieurs fois
3. Lance la séance

### Scénario D : Sons ne se chargent pas ❌

**Console :**
```
❌ Erreur chargement inhale: 404 Not Found
```

**Cause :** Fichiers MP3 manquants

**Solution :**
1. Vérifie `assets/audio-manifest.json`
2. Vérifie que les MP3 sont sur le serveur
3. Teste l'URL directement dans le navigateur

## 🎯 Actions à faire

**1. Ouvre la console Safari**
**2. Lance une séance**
**3. Copie-moi EXACTEMENT ce que tu vois dans la console**

Format :
```
[Copie tous les logs ici]
```

Avec ces logs, je pourrai identifier le problème exact et te donner la solution précise ! 🔍
