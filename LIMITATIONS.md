# ⚠️ LIMITATIONS ACTUELLES - À LIRE AVANT INSTALLATION

## 🎵 Stockage des fichiers audio uploadés

### ❌ PROBLÈME ACTUEL

**Les fichiers MP3/WAV uploadés NE SONT PAS sauvegardés entre les sessions.**

Pourquoi ?
- Les navigateurs ne permettent pas de sauvegarder directement des fichiers dans localStorage
- Les fichiers sont chargés en mémoire temporaire via `URL.createObjectURL()`
- Quand tu fermes l'app et la rouvres : les fichiers sont perdus

**Ce qui EST sauvegardé :**
- ✅ Durée de la séance
- ✅ Temps d'inspiration/expiration
- ✅ Sons de cloche sélectionnés (synthétisés)
- ✅ Volumes de tous les sons
- ✅ Sélection "son personnalisé" (mais pas le fichier lui-même)

**Ce qui N'EST PAS sauvegardé :**
- ❌ Fichiers MP3/WAV uploadés pour inspiration
- ❌ Fichiers MP3/WAV uploadés pour expiration
- ❌ Musiques de fond uploadées

### 💡 SOLUTIONS POSSIBLES

#### Solution 1 : Re-upload à chaque session (ACTUEL)
**Statut : Déjà implémenté**

Tu dois :
1. Ouvrir l'app
2. Uploader tes sons/musiques
3. Utiliser l'app
4. À la prochaine ouverture → re-uploader

✅ Avantages :
- Fonctionne maintenant
- Aucune limite de taille
- Tous formats supportés

❌ Inconvénients :
- Il faut re-uploader à chaque fois
- Fastidieux si tu as beaucoup de fichiers

#### Solution 2 : IndexedDB (À IMPLÉMENTER)
**Statut : Nécessite modification du code**

Permettrait de :
- Sauvegarder les fichiers audio dans le navigateur
- Les retrouver automatiquement à chaque ouverture
- Les supprimer/gérer facilement

✅ Avantages :
- Persistance totale
- Jusqu'à ~50 MB de stockage
- Gestion propre des fichiers

❌ Inconvénients :
- Plus complexe à implémenter
- Code supplémentaire (~200 lignes)
- Peut être vidé si l'utilisateur nettoie le cache

Limite de stockage estimée : 3-10 fichiers MP3 de qualité normale

#### Solution 3 : Serveur personnel (AVANCÉ)
**Statut : Nécessite infrastructure**

Héberger tes fichiers sur un serveur et les charger automatiquement.

✅ Avantages :
- Aucune limite
- Fichiers disponibles partout
- Peut être partagé avec d'autres

❌ Inconvénients :
- Nécessite un serveur
- Plus complexe
- Coûts potentiels

### 🎯 RECOMMANDATION

**Pour l'instant (version actuelle) :**
1. Utilise les **sons de cloche synthétisés** (sauvegardés ✅)
2. Pour les musiques : garde 2-3 MP3 favoris sur ton iPhone
3. Upload-les au début de chaque session (30 secondes)

**Si tu veux la persistance (moi je peux implémenter) :**
→ Je peux ajouter IndexedDB pour sauvegarder automatiquement

### 📊 Tableau récapitulatif

| Élément | Sauvegardé | Persiste après fermeture |
|---------|------------|--------------------------|
| Durée séance | ✅ Oui | ✅ Oui |
| Temps respiration | ✅ Oui | ✅ Oui |
| Sons de cloche (synthétisés) | ✅ Oui | ✅ Oui |
| Volumes | ✅ Oui | ✅ Oui |
| **Fichiers MP3 uploadés** | ❌ Non | ❌ Non |
| **Musiques uploadées** | ❌ Non | ❌ Non |

### 🔧 Tu veux que j'ajoute IndexedDB ?

Si oui, je peux :
1. Implémenter le stockage des fichiers audio
2. Ajouter une interface de gestion (supprimer, renommer)
3. Limiter à X fichiers pour éviter de saturer
4. Ajouter un indicateur de taille utilisée

**Temps estimé : 30 minutes de code**

Dis-moi si tu veux cette fonctionnalité ! 🚀
