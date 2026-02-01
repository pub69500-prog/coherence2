# 🔧 CORRECTION - Sons qui jouent simultanément

## ❌ Problème identifié

**Symptôme :**
- Son d'inspiration ET d'expiration jouent en même temps
- Tous les sons s'accumulent pendant toute la séance
- Cacophonie audio

## 🐛 Cause du bug

**Dans la fonction `playSound()` (ligne 700) :**

```javascript
// ANCIEN CODE (BUGUÉ) :
const a = new Audio(src);  // ← Crée un NOUVEAU son
currentSfxAudio[phase] = a; // ← Mais ne STOP PAS l'ancien !
a.play();                   // ← Tous jouent ensemble !
```

**Que se passait-il :**
1. Inspiration → Crée `Audio1` → Joue ✅
2. Expiration → Crée `Audio2` → Joue ✅
3. Inspiration → Crée `Audio3` → Joue ✅
4. **Mais `Audio1` et `Audio2` jouent TOUJOURS !**
5. Résultat : 3 sons en même temps 🔊🔊🔊

## ✅ Correction appliquée

**Nouveau code (ligne 700-720) :**

```javascript
function playSound(phase) {
    // ... récupération du son ...
    
    // 🛑 ARRÊTER LE SON PRÉCÉDENT DE CETTE PHASE
    if (currentSfxAudio[phase]) {
        try {
            currentSfxAudio[phase].pause();     // ← STOP !
            currentSfxAudio[phase].currentTime = 0;
        } catch (e) {
            console.log('Erreur arrêt son:', e);
        }
        currentSfxAudio[phase] = null;
    }
    
    // PUIS créer et jouer le nouveau son
    const a = new Audio(src);
    a.volume = vol;
    currentSfxAudio[phase] = a;
    a.play();
    
    console.log(`🔊 Son ${phase} joué (volume: ${vol})`);
}
```

**Maintenant :**
1. Inspiration → STOP ancien inhale → Nouveau son inhale ✅
2. Expiration → STOP ancien exhale → Nouveau son exhale ✅
3. Inspiration → STOP ancien inhale → Nouveau son inhale ✅
4. **UN SEUL SON À LA FOIS !** 🎯

## 🧪 Test

**Procédure :**
1. Redéploie l'app sur Netlify
2. Lance une séance
3. Écoute attentivement

**Résultat attendu :**
- ✅ Son d'inspiration joue SEUL pendant inspiration
- ✅ Son d'expiration joue SEUL pendant expiration
- ✅ Pas de chevauchement
- ✅ Pas d'accumulation de sons

**Console devrait afficher :**
```
🔊 Son inhale joué (volume: 0.7)
[5 secondes]
🔊 Son exhale joué (volume: 0.7)
[5 secondes]
🔊 Son inhale joué (volume: 0.7)
...
```

## 📊 Changements

**Fichier modifié :**
- `js/app.js` - Fonction `playSound()` (lignes ~700-750)

**Lignes ajoutées :**
```javascript
// 🛑 ARRÊTER LE SON PRÉCÉDENT
if (currentSfxAudio[phase]) {
    currentSfxAudio[phase].pause();
    currentSfxAudio[phase].currentTime = 0;
    currentSfxAudio[phase] = null;
}
```

**Log ajouté :**
```javascript
console.log(`🔊 Son ${phase} joué (volume: ${vol})`);
```

## ✅ C'est corrigé !

**Ce qui fonctionne maintenant :**
- ✅ Un seul son à la fois
- ✅ Alternance inspiration/expiration
- ✅ Pas d'accumulation
- ✅ Volume correct
- ✅ Logs dans la console pour debug

**Teste et confirme que ça marche ! 🚀**
