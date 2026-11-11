#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Déploiement DevOps Calculator..."

# Stop & remove existing containers
docker compose down --remove-orphans 2>/dev/null || true

# Pull latest images
docker compose pull

# Start services
docker compose up -d

# Wait for backend health
echo "⏳ Attente du backend..."
for i in $(seq 1 15); do
  if curl -sf http://localhost:5000/health > /dev/null 2>&1; then
    echo "✅ Backend opérationnel"
    break
  fi
  sleep 2
done

echo "✅ Frontend: http://localhost:3002"
echo "✅ Backend:  http://localhost:5000"
echo "🎉 Déploiement terminé !"
