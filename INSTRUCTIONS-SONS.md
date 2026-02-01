# 🎵 INSTRUCTIONS - Ajouter tes sons MP3

## 📁 Étape 1 : Place tes fichiers MP3

### Structure des dossiers

```
coherence-cardiaque/
├── sounds/
│   ├── inhale/
│   │   ├── bol-tibetain-aigu.mp3     ← Tes MP3 ici
│   │   ├── clochette-claire.mp3
│   │   └── carillon-doux.mp3
│   │
│   └── exhale/
│       ├── bol-tibetain-grave.mp3    ← Tes MP3 ici
│       ├── cloche-profonde.mp3
│       └── gong-leger.mp3
│
└── music/
    ├── meditation-1.mp3                ← Musiques de fond ici
    ├── nature-forest.mp3
    └── ambient-432hz.mp3
```

### Règles pour les noms de fichiers

**✅ Bons noms :**
- `bol-tibetain.mp3`
- `cloche_claire.mp3`
- `son-inspiration-1.mp3`

**❌ Mauvais noms (à éviter) :**
- `Mon Son (2).mp3` (espaces et parenthèses)
- `Cloche&Bell.mp3` (caractères spéciaux)
- `son%20test.mp3` (caractères encodés)

**Conseil :** Utilise des tirets `-` ou underscores `_`, pas d'espaces ni de caractères spéciaux.

---

## ⚙️ Étape 2 : Générer le manifest

### Option A : Avec Python (recommandé)

**Sur ton ordinateur :**
```bash
cd coherence-cardiaque-pwa
python3 generate-audio-manifest.py
```

**Résultat :**
```
✅ Manifest généré: ./assets/audio-manifest.json
{
  "inhale": [
    "bol-tibetain-aigu.mp3",
    "carillon-doux.mp3",
    "clochette-claire.mp3"
  ],
  "exhale": [
    "bol-tibetain-grave.mp3",
    "cloche-profonde.mp3",
    "gong-leger.mp3"
  ],
  "music": [
    "ambient-432hz.mp3",
    "meditation-1.mp3",
    "nature-forest.mp3"
  ]
}
```

### Option B : Manuellement (si pas de Python)

**Édite le fichier `assets/audio-manifest.json` :**

```json
{
  "inhale": [
    "bol-tibetain-aigu.mp3",
    "clochette-claire.mp3",
    "carillon-doux.mp3"
  ],
  "exhale": [
    "bol-tibetain-grave.mp3",
    "cloche-profonde.mp3",
    "gong-leger.mp3"
  ],
  "music": [
    "meditation-1.mp3",
    "nature-forest.mp3"
  ]
}
```

**Important :**
- Liste exactement les noms de fichiers
- Respecte les majuscules/minuscules
- Format JSON valide (virgules, guillemets)

---

## 🚀 Étape 3 : Déployer

### Sur Netlify

**1. Glisse tout le dossier sur Netlify**
   - Fichiers MP3 compris
   - Le manifest mis à jour

**2. Netlify va uploader :**
   - Tous les fichiers
   - Ça peut prendre quelques minutes si beaucoup de MP3

**3. Vérifie que ça marche :**
   - Ouvre l'app
   - Les menus déroulants doivent afficher tes sons
   - Teste la lecture

---

## 🎯 Résultat dans l'app

### Menu "Son d'inspiration"

```
Aucun
─────────────────
bol-tibetain-aigu.mp3
carillon-doux.mp3
clochette-claire.mp3
```

### Menu "Son d'expiration"

```
Aucun
─────────────────
bol-tibetain-grave.mp3
cloche-profonde.mp3
gong-leger.mp3
```

### Menu "Musique de fond"

```
Aucune
─────────────────
ambient-432hz.mp3
meditation-1.mp3
nature-forest.mp3
```

---

## 🔄 Ajouter/Modifier des sons plus tard

**1. Ajoute/supprime des MP3 dans les dossiers**

**2. Régénère le manifest :**
```bash
python3 generate-audio-manifest.py
```

**3. Redéploie sur Netlify**

**C'est tout ! ✅**

---

## 📏 Tailles recommandées

### Sons de cloche (1-3 secondes)
```
Durée : 2-3 secondes
Format : MP3 320kbps
Taille : 50-80 KB chacun
Total (6 sons) : ~400 KB
```

### Musiques de fond (5-30 minutes)
```
Durée : 5-10 minutes (ou en boucle)
Format : MP3 192kbps (qualité/taille équilibrée)
Taille : 5-10 MB chacun
Total (3 musiques) : ~20 MB
```

**Total général : ~20-25 MB**
→ Netlify gratuit = 100 GB/mois = Largement suffisant ! ✅

---

## ⚠️ Dépannage

### Problème : Mes sons n'apparaissent pas

**Vérifications :**
1. Fichiers bien dans `sounds/inhale/` et `sounds/exhale/` ?
2. Extensions : `.mp3`, `.wav`, `.m4a`, `.ogg` uniquement
3. Manifest régénéré après ajout des fichiers ?
4. Tout déployé sur Netlify (fichiers + manifest) ?

**Console navigateur :**
```
Ouvre la console Safari
Cherche les erreurs :
❌ "Failed to load ./sounds/inhale/mon-son.mp3"
→ Fichier mal nommé ou manquant
```

### Problème : Le manifest est vide

**Si `audio-manifest.json` contient :**
```json
{
  "inhale": [],
  "exhale": [],
  "music": []
}
```

**Solutions :**
1. Les MP3 sont-ils bien dans les dossiers ?
2. Relance le script Python
3. Ou édite le manifest manuellement

---

## ✅ Checklist finale

Avant de déployer :

- [ ] MP3 placés dans les bons dossiers
- [ ] Noms de fichiers sans espaces ni caractères spéciaux
- [ ] Manifest généré (audio-manifest.json contient les noms)
- [ ] Tout testé localement avec `python3 test-server.py`
- [ ] Déployé sur Netlify
- [ ] Menus déroulants affichent les sons
- [ ] Lecture testée sur iPhone

---

**Tes sons de 3 secondes vont être parfaits ! 🎵**
