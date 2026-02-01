# Guide de contribution

Merci de votre intérêt pour contribuer à Cohérence Cardiaque ! 🙏

## Comment contribuer

### Signaler un bug 🐛

1. Vérifiez que le bug n'a pas déjà été signalé dans les [Issues](../../issues)
2. Créez une nouvelle issue en décrivant :
   - Le comportement attendu
   - Le comportement observé
   - Les étapes pour reproduire
   - Votre environnement (navigateur, OS)

### Proposer une nouvelle fonctionnalité ✨

1. Ouvrez une issue pour discuter de votre idée
2. Attendez les retours avant de commencer le développement
3. Si approuvé, créez une Pull Request

### Soumettre une Pull Request 🔄

1. Fork le projet
2. Créez une branche pour votre fonctionnalité :
   ```bash
   git checkout -b feature/ma-super-fonctionnalite
   ```
3. Committez vos changements :
   ```bash
   git commit -m "Ajout de ma super fonctionnalité"
   ```
4. Pushez vers votre fork :
   ```bash
   git push origin feature/ma-super-fonctionnalite
   ```
5. Ouvrez une Pull Request

## Standards de code

### JavaScript
- Utilisez ES6+ 
- Pas de dépendances externes (vanilla JS uniquement)
- Commentez les fonctions complexes
- Nommage en camelCase

### CSS
- Utilisez les variables CSS pour les couleurs
- Mobile-first design
- Préfixez les propriétés si nécessaire (-webkit-)

### HTML
- Sémantique HTML5
- Accessibilité (ARIA labels si nécessaire)

## Structure des commits

Utilisez des messages de commit clairs :
- `feat: ajout de la fonctionnalité X`
- `fix: correction du bug Y`
- `style: amélioration du CSS Z`
- `docs: mise à jour de la documentation`
- `refactor: refactorisation du code`

## Tests

Avant de soumettre :
1. Testez sur Chrome, Firefox et Safari
2. Testez sur mobile (iOS Safari important)
3. Vérifiez que les sons fonctionnent
4. Testez les volumes et les animations

## Idées de contributions

- 🎨 Nouveaux thèmes de couleurs
- 🔊 Nouveaux sons synthétisés
- 📱 Améliorations responsive
- ♿ Accessibilité
- 🌍 Traductions (i18n)
- 📊 Statistiques de session
- 💾 Sauvegarde des préférences (localStorage)
- 🎵 Auto-chargement des fichiers des dossiers sounds/ et music/

## Questions ?

N'hésitez pas à ouvrir une issue pour toute question !

Merci pour votre contribution ! ❤️
