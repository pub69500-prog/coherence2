const fs = require('fs');
const path = require('path');

// Fonction pour lire récursivement les fichiers d'un dossier
function getAudioFilesInDirectory(dir) {
    try {
        return fs.readdirSync(dir).filter(file => {
            const stat = fs.statSync(path.join(dir, file));
            // Filtre uniquement les fichiers audio
            return stat.isFile() && /\.(mp3|m4a|wav|ogg|flac)$/i.test(file);
        });
    } catch (err) {
        console.warn(`Dossier ${dir} non trouvé, ignoré.`);
        return [];
    }
}

// Générer le manifest
const manifest = {
    inhale: getAudioFilesInDirectory('./sounds/inhale'),
    exhale: getAudioFilesInDirectory('./sounds/exhale'),
    music: getAudioFilesInDirectory('./music')
};

// Créer le dossier assets s'il n'existe pas
if (!fs.existsSync('./assets')) {
    fs.mkdirSync('./assets');
}

// Écrire le fichier JSON
fs.writeFileSync(
    './assets/audio-manifest.json',
    JSON.stringify(manifest, null, 2)
);

console.log('✅ Manifest généré avec succès !');
console.log(`   - ${manifest.inhale.length} sons d'inspiration`);
console.log(`   - ${manifest.exhale.length} sons d'expiration`);
console.log(`   - ${manifest.music.length} musiques`);
console.log('\n📝 Fichiers musique détectés:');
manifest.music.forEach(file => console.log(`   - ${file}`));