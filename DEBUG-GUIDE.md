# 🐛 GUIDE DE DEBUG - Version Corrigée

## 🔧 Corrections appliquées dans cette version

### 1. ✅ VOLUMES - Ajout de logs détaillés

**Changements :**
- Logs console à chaque étape de lecture de son
- Affichage du volume calculé
- Vérification de l'Audio Context

**Comment vérifier :**
1. Sur iPhone, ouvre Safari
2. Va dans Réglages → Safari → Avancé → Web Inspector : **ON**
3. Sur ton Mac : Safari → Develop → [Ton iPhone] → [L'app]
4. Dans la console, lance une respiration
5. Tu verras :
```
🔔 createBellSound appelée: type=bell1, volume=70%
✅ Audio Context state: running
🔊 Volume calculé: 70% → amplitude=0.210
✅ Son joué: freq=432Hz, type=sine
```

**Si le volume ne change toujours pas :**
- Change le volume à 10% → amplitude devrait être ~0.030
- Change le volume à 100% → amplitude devrait être 0.300
- Si l'amplitude ne change pas = problème hardware ou navigateur

---

### 2. ✅ RESPONSIVE - Débordement corrigé

**Changements :**
```css
html, body { overflow-x: hidden !important; width: 100%; max-width: 100vw; }
.container, .main-content, .breathing-zone, .control-panel { 
    width: 100%; 
    max-width: 100%; 
    box-sizing: border-box;
}
```

**Test :**
1. Ouvre l'app sur iPhone
2. Regarde s'il y a un scroll horizontal
3. Essaie de swiper à gauche/droite
4. Tout doit être contenu dans l'écran

**Si ça déborde encore :**
- Ouvre l'inspecteur web
- Cherche quel élément a width > 100vw
- Me dire lequel pour que je corrige

---

### 3. ✅ WAKE LOCK - Empêche la mise en veille

**Changements :**
- Wake Lock API activé au démarrage de session
- Audio Context maintenu actif
- Libération propre à l'arrêt

**Test :**
1. Lance une séance
2. Regarde la console :
```
✅ Wake Lock activé - écran restera allumé
🎵 Audio Context state: running
```
3. Laisse l'écran s'éteindre (ou appuie sur Power)
4. Les cloches devraient continuer

**Si ça ne marche pas :**
Tu verras dans la console :
```
⚠️ Wake Lock non disponible: [raison]
```

**Note importante sur iOS :**
- Wake Lock peut ne PAS être supporté sur tous les iOS
- Si tu vois "Wake Lock non disponible" → c'est normal sur certains iPhone
- Solution alternative : Réglages → Luminosité → Verrouillage auto → **Jamais** (temporairement)

---

## 🧪 TESTS COMPLETS À FAIRE

### Test 1 : Volumes des cloches

**Procédure :**
1. Volume inspiration à 10%
2. Lance "Commencer"
3. Écoute la cloche → son très faible
4. Stop
5. Volume inspiration à 100%
6. Lance "Commencer"  
7. Écoute la cloche → son fort

**Console doit montrer :**
```
À 10% : 🔊 Volume calculé: 10% → amplitude=0.030
À 100% : 🔊 Volume calculé: 100% → amplitude=0.300
```

✅ Si l'amplitude change mais pas le volume perçu → problème iOS
❌ Si l'amplitude ne change pas → me le dire

---

### Test 2 : Volume de la musique

**Procédure :**
1. Upload une musique
2. Sélectionne-la (bouton ▶)
3. Volume musique à 10%
4. Lance "Commencer"
5. Musique très faible ✅
6. PENDANT la séance, bouge le curseur à 100%
7. Musique devrait augmenter immédiatement

**Console doit montrer :**
```
Music volume updated to: 0.1
Music volume updated to: 1.0
```

---

### Test 3 : Responsive

**Procédure :**
1. Ouvre l'app
2. Swipe à gauche → rien ne doit déborder
3. Swipe à droite → rien ne doit déborder
4. Tout doit tenir dans l'écran
5. Pas de barre de scroll horizontale en bas

✅ OK
❌ Si débordement → screenshot + me dire où

---

### Test 4 : Veille

**Procédure :**
1. Lance une séance de 2 minutes
2. Regarde la console :
```
✅ Wake Lock activé - écran restera allumé
```
3. Appuie sur le bouton Power (veille)
4. Attends 10 secondes
5. Rallume l'écran

**Résultat attendu :**
- ✅ Cloches ont continué
- ✅ Musique a continué
- ✅ Timer a continué

**Résultat possible si Wake Lock non supporté :**
- ❌ Cloches arrêtées
- ✅ Musique a continué (HTML5 Audio résiste mieux)

---

## 🆘 EN CAS DE PROBLÈME

### Problème : Volumes ne changent toujours pas

**Debug :**
1. Console ouverte
2. Change volume inspiration à 20%
3. Lance respiration
4. Copie-moi EXACTEMENT ce que tu vois dans la console

**Questions :**
- L'amplitude dans la console change-t-elle ?
- Le pourcentage affiché à l'écran change-t-il ?
- Entends-tu le son (même s'il ne change pas) ?

---

### Problème : Débordement persiste

**Debug :**
1. Inspecteur web ouvert
2. Clique sur l'icône de sélection (flèche en haut à gauche)
3. Touche la partie qui déborde
4. Screenshot de l'inspecteur
5. Regarde les valeurs width, padding, margin

---

### Problème : Cloches s'arrêtent en veille

**Diagnostic :**
1. Console : "✅ Wake Lock activé" ? → OUI/NON
2. Si NON → Wake Lock pas supporté sur ton iPhone
3. Si OUI → Wake Lock activé mais iOS suspend quand même

**Solution temporaire :**
- Réglages iPhone → Luminosité → Verrouillage auto → **Jamais**
- Ou garde l'écran allumé pendant la séance

**Note :**
iOS est TRÈS restrictif avec l'audio en arrière-plan. C'est pour économiser la batterie.
Certaines versions d'iOS bloquent tout, même avec Wake Lock.

---

## 📊 RAPPORT À ME DONNER

Après tes tests, dis-moi :

**Volumes :**
- [ ] Cloches : Volume change ✅ / Ne change pas ❌
- [ ] Musique : Volume change ✅ / Ne change pas ❌
- [ ] Console : Amplitude change ✅ / Reste fixe ❌

**Responsive :**
- [ ] Pas de débordement ✅ / Déborde encore ❌
- [ ] Si déborde : où exactement ?

**Veille :**
- [ ] Wake Lock activé ✅ / Non disponible ❌
- [ ] Cloches continuent ✅ / S'arrêtent ❌
- [ ] Musique continue ✅ / S'arrête ❌

---

**Avec ces infos, je pourrai corriger précisément ! 🎯**
