# 🎵 Sons d'expiration

**Place ici tes fichiers MP3 pour les sons d'expiration.**

## 📏 Recommandations

**Durée idéale : 2-3 secondes**
- Pas de coupure si respiration = 3s minimum
- Signal clair au début de l'expiration
- Le reste du temps = musique de fond

## 📁 Exemples de noms de fichiers

✅ **Bons noms :**
```
bol-tibetain-grave.mp3
cloche-profonde.mp3
gong-leger.mp3
son-expiration-1.mp3
```

❌ **Mauvais noms :**
```
Mon Son (2).mp3        (espaces)
Cloche&Bell.mp3        (caractères spéciaux)
son expiré.mp3         (espaces)
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
  "exhale": [
    "bol-tibetain-grave.mp3",
    "cloche-profonde.mp3",
    ...
  ]
}
```

**3. Déploie sur Netlify**

**4. Les sons apparaissent dans le menu "Son d'expiration" ! ✅**

## 🎼 Types de sons recommandés

- Bols tibétains (ton grave)
- Cloches profondes
- Gongs doux
- Dong graves
- Sons apaisants et profonds

→ Signal = début d'expiration
