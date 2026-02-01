# 🎵 Sons d'inspiration

**Place ici tes fichiers MP3 pour les sons d'inspiration.**

## 📏 Recommandations

**Durée idéale : 2-3 secondes**
- Pas de coupure si respiration = 3s minimum
- Signal clair au début de l'inspiration
- Le reste du temps = musique de fond

## 📁 Exemples de noms de fichiers

✅ **Bons noms :**
```
bol-tibetain-aigu.mp3
clochette-claire.mp3
carillon-doux.mp3
son-inspiration-1.mp3
```

❌ **Mauvais noms :**
```
Mon Son (2).mp3        (espaces)
Cloche&Bell.mp3        (caractères spéciaux)
son inspiré.mp3        (espaces)
```

## 🔄 Après avoir ajouté tes fichiers

**1. Génère le manifest :**
```bash
python3 generate-audio-manifest.py
```

**2. Vérifie le contenu :**
Le fichier `assets/audio-manifest.json` doit contenir :
```json
{
  "inhale": [
    "bol-tibetain-aigu.mp3",
    "clochette-claire.mp3",
    ...
  ]
}
```

**3. Déploie sur Netlify**

**4. Les sons apparaissent dans le menu "Son d'inspiration" ! ✅**

## 🎼 Types de sons recommandés

- Bols tibétains (ton aigu)
- Clochettes cristallines
- Carillons doux
- Ting courts
- Sons clairs et légers

→ Signal = début d'inspiration
