#!/usr/bin/env bash
set -euo pipefail

# Run from the extracted project's root (the directory containing package.json).
if [[ ! -f package.json ]]; then
  echo "Error: ejecutá este script desde la carpeta maxi-broker-app donde está package.json." >&2
  exit 1
fi

if [[ -f .env ]]; then
  echo "Error: encontré un archivo .env. Por seguridad, no lo voy a incluir en Git." >&2
  echo "Movelo fuera del proyecto o renombralo antes de continuar." >&2
  exit 1
fi

if [[ ! -d .git ]]; then
  git init -b main
fi
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin https://github.com/lucianosposito312/maxi-broker-app.git
else
  git remote add origin https://github.com/lucianosposito312/maxi-broker-app.git
fi

git add .
echo "Archivos que se van a publicar:"
git status --short
if ! git diff --cached --quiet; then
  git commit -m "Migrate original Maxi Broker to Vercel"
fi
git push -u origin main
