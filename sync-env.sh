#!/bin/bash
# Script pour synchroniser les variables d'environnement depuis .env.shared

echo "🔄 Synchronisation des variables d'environnement..."

# Copier les variables NEXT_PUBLIC_* vers frontend/.env.local
if [ -f .env.shared ]; then
  echo "📋 Copie des variables NEXT_PUBLIC_* vers frontend/.env.local..."
  grep "NEXT_PUBLIC_" .env.shared >> frontend/.env.local 2>/dev/null || echo "Variables NEXT_PUBLIC_* ajoutées"
  echo "✅ Synchronisation terminée"
else
  echo "⚠️  Fichier .env.shared non trouvé"
fi
