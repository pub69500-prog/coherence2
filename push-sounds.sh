#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# 1) Regénérer le manifest
python3 generate-audio-manifest.py

# 2) Ajouter sons + manifest
git add sounds/ assets/audio-manifest.json

# 3) Commit auto si nécessaire
if git diff --cached --quiet; then
  echo "Rien à pousser (aucun changement détecté)."
  exit 0
fi

msg="Update sounds $(date '+%Y-%m-%d %H:%M')"
git commit -m "$msg"

# 4) Push
git push origin main

echo "✅ Push terminé : $msg"
