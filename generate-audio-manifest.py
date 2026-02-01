#!/usr/bin/env python3
"""Generate ./assets/audio-manifest.json from ./sounds/* and ./music/

Usage:
  python3 generate-audio-manifest.py

It will list .mp3/.wav/.ogg/.m4a files.
"""
import json, os, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)

EXTS = {".mp3", ".wav", ".ogg", ".m4a"}

def list_audio(dirpath: pathlib.Path):
    if not dirpath.exists():
        return []
    files=[]
    for p in dirpath.iterdir():
        if p.is_file() and p.suffix.lower() in EXTS and not p.name.startswith("."):
            files.append(p.name)
    return sorted(files, key=lambda s: s.lower())

manifest = {
    "inhale": list_audio(ROOT / "sounds" / "inhale"),
    "exhale": list_audio(ROOT / "sounds" / "exhale"),
    "music": list_audio(ROOT / "music"),
}

out = ASSETS / "audio-manifest.json"
out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print("✅ Manifest généré:", out)
print(json.dumps(manifest, ensure_ascii=False, indent=2))
