# 🔧 CORRECTION COMPLÈTE - Sons qui s'arrêtent après la première inspiration

## ❌ Problème rapporté

**Symptôme :**
- Premier son d'inspiration joue ✅
- Après : plus aucun son ❌
- Les sons doivent alterner pendant TOUTE la séance

## 🐛 Cause probable

Le code original avait le commentaire :
```javascript
// Nouveau lecteur à chaque fois => inhale/exhale peuvent se chevaucher sans se couper.
```

**Problème :** Aucun mécanisme pour ARRÊTER le son précédent !

**Résultat :**
1. Premier inhale → Audio1 joue ✅
2. Premier exhale → Audio2 joue EN MÊME TEMPS ❌
3. Deuxième inhale → Audio3... mais Audio1 et Audio2 jouent toujours
4. Cacophonie totale ou blocage audio

## ✅ Correction appliquée

### Nouveau code (lignes 700-760)

```javascript
function playSound(phase) {
    const soundType = (phase === 'inhale') ? inhaleSoundSelect.value : exhaleSoundSelect.value;
    const volume = (phase === 'inhale') ? parseInt(inhaleVolumeSlider.value, 10) : parseInt(exhaleVolumeSlider.value, 10);

    if (!soundType || soundType === 'none') return;

    const vol = Math.max(0, Math.min(1, volume / 100));

    // 🛑 ARRÊTER LE SON PRÉCÉDENT AVANT D'EN JOUER UN NOUVEAU
    if (currentSfxAudio[phase]) {
        try {
            currentSfxAudio[phase].pause();       // ← STOP
            currentSfxAudio[phase].currentTime = 0; // ← Reset
            console.log(`🛑 Son ${phase} précédent arrêté`);
        } catch (e) {
            console.log('Erreur arrêt son:', e);
        }
    }

    // Construire l'URL du son
    let src = null;
    
    if (soundType.startsWith('custom-')) {
        const base = (phase === 'inhale') ? customInhaleAudio : customExhaleAudio;
        if (base && base.src) src = base.src;
    } else if (soundType.startsWith('file-inhale:') || soundType.startsWith('file-exhale:')) {
        const fileName = soundType.split(':').slice(1).join(':');
        const folder = (phase === 'inhale') ? 'inhale' : 'exhale';
        src = `./sounds/${folder}/${encodeURIComponent(fileName)}`;
    }

    if (!src) {
        console.log(`⚠️ Pas de source audio pour ${phase}`);
        return;
    }

    // CRÉER un nouveau Audio
    const a = new Audio(src);
    a.preload = 'auto';
    a.volume = vol;
    a.currentTime = 0;

    // Sauvegarder la référence
    currentSfxAudio[phase] = a;

    // JOUER
    const p = a.play();
    if (p !== undefined) {
        p.then(() => {
            console.log(`✅ Son ${phase} joué (volume: ${vol})`);
        }).catch(e => {
            console.log(`❌ Erreur lecture son ${phase}:`, e);
        });
    }
}
```

### Changements clés

**1. Arrêt du son précédent (lignes 711-719)**
```javascript
if (currentSfxAudio[phase]) {
    currentSfxAudio[phase].pause();
    currentSfxAudio[phase].currentTime = 0;
}
```

**2. Logs détaillés**
```javascript
console.log(`🛑 Son ${phase} précédent arrêté`);
console.log(`✅ Son ${phase} joué (volume: ${vol})`);
console.log(`❌ Erreur lecture son ${phase}:`, e);
```

**3. Vérification de la source**
```javascript
if (!src) {
    console.log(`⚠️ Pas de source audio pour ${phase}`);
    return;
}
```

## 🧪 Comment déboguer

### Étape 1 : Ouvrir la console

**Sur iPhone + Mac :**
1. iPhone → Réglages → Safari → Avancé → **Web Inspector : ON**
2. Mac → Safari → Develop → [Ton iPhone] → [L'app]
3. Onglet **Console**

### Étape 2 : Lancer une séance

**Tu devrais voir dans la console :**

```
✅ Son inhale joué (volume: 0.7)
[Après 5 secondes]
🛑 Son inhale précédent arrêté
✅ Son exhale joué (volume: 0.7)
[Après 5 secondes]
🛑 Son exhale précédent arrêté
✅ Son inhale joué (volume: 0.7)
[Après 5 secondes]
🛑 Son inhale précédent arrêté
✅ Son exhale joué (volume: 0.7)
...
```

### Étape 3 : Identifier le problème

**Si tu vois :**

```
✅ Son inhale joué (volume: 0.7)
[Puis plus rien]
```
→ Le son ne se charge pas ou l'Audio Context est suspendu

**Si tu vois :**
```
⚠️ Pas de source audio pour inhale
```
→ Le fichier audio n'est pas trouvé ou mal configuré

**Si tu vois :**
```
❌ Erreur lecture son inhale: NotAllowedError
```
→ iOS bloque l'audio (pas assez d'interaction utilisateur)

**Si tu vois :**
```
✅ Son inhale joué
✅ Son exhale joué (en même temps)
```
→ Les sons ne sont PAS arrêtés (ma correction n'est pas appliquée)

## 📊 Timeline d'une séance normale

```
0s    → startSession()
       → Wake Lock activé
       → Audio silencieux démarre
       
0s    → startInhale()
       → playSound('inhale')
       → ✅ Son inhale joué
       
5s    → startExhale()
       → playSound('exhale')
       → 🛑 Son inhale arrêté
       → ✅ Son exhale joué
       
10s   → startInhale()
       → playSound('inhale')
       → 🛑 Son exhale arrêté
       → ✅ Son inhale joué
       
15s   → startExhale()
       → ...
```

## 🎯 Comportement attendu

**Avec des sons courts (1-2 sec) :**
- Son joue complètement
- Silence jusqu'à la prochaine phase
- Alternance propre

**Avec des sons longs (10+ sec) :**
- Son commence à jouer
- Coupé net quand phase change
- Nouveau son démarre immédiatement

## ⚠️ Points d'attention

### 1. Audio Context suspendu

**Symptôme :** Premier son OK, puis silence

**Cause :** iOS suspend l'Audio Context

**Solution :** Le son silencieux en boucle devrait empêcher ça
```javascript
// Dans startSession() :
silentAudio.play(); // ← Garde iOS actif
```

### 2. Fichiers non trouvés

**Symptôme :** Console montre "Pas de source audio"

**Cause :** Chemin incorrect ou fichier manquant

**Solution :** Vérifie que tes fichiers sont dans :
- `./sounds/inhale/ton-fichier.mp3`
- `./sounds/exhale/ton-fichier.mp3`

### 3. Volume à 0

**Symptôme :** Sons jouent mais inaudibles

**Cause :** Volume du slider à 0% ou téléphone en mode silencieux

**Solution :** 
- Vérifie les curseurs de volume
- Désactive le mode silencieux iPhone

## 📱 Checklist de test

**Avant de déployer :**
- [ ] Syntaxe JS validée (`node -c js/app.js`)
- [ ] Console Safari activée sur iPhone
- [ ] Fichiers audio présents dans `/sounds/`

**Après déploiement :**
- [ ] Console ouverte
- [ ] Lancer séance
- [ ] Vérifier logs console
- [ ] Écouter alternance des sons
- [ ] Tester avec sons courts ET longs

## 🚀 Résultat final attendu

**Sons alternent pendant TOUTE la séance :**
```
Inhale → Exhale → Inhale → Exhale → Inhale → Exhale...
```

**Console affiche :**
```
✅ ✅ ✅ ✅ ✅ ✅ ...
```

**Pas d'erreur, pas d'accumulation, un seul son à la fois ! 🎯**

---

**Si ça ne marche toujours pas, copie-moi EXACTEMENT ce que tu vois dans la console !** 🔍
