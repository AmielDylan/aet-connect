#!/bin/bash

# Script simple pour tester les endpoints API avec curl
# Nécessite que le backend soit démarré

API_URL="http://localhost:3001"

echo "🧪 TEST DES ENDPOINTS API"
echo "═══════════════════════════════════════════════════"
echo ""
echo "⚠️  IMPORTANT: Ce script nécessite:"
echo "   1. Que le backend soit démarré (npm run dev)"
echo "   2. Un token Supabase Auth valide"
echo ""
echo "Pour obtenir un token, utilisez Supabase Dashboard ou le script test-api-endpoints.ts"
echo ""
read -p "Entrez un token Supabase Auth (ou appuyez sur Entrée pour tester sans token): " TOKEN

echo ""
echo "═══════════════════════════════════════════════════"
echo "1. Test GET /api/auth/me"
echo "═══════════════════════════════════════════════════"

if [ -z "$TOKEN" ]; then
  echo "Test sans token (devrait échouer):"
  curl -X GET "$API_URL/api/auth/me" \
    -H "Content-Type: application/json" \
    -w "\nStatus: %{http_code}\n" \
    -s
else
  echo "Test avec token:"
  curl -X GET "$API_URL/api/auth/me" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -w "\nStatus: %{http_code}\n" \
    -s | jq '.' 2>/dev/null || cat
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "2. Test GET /api/dashboard/stats"
echo "═══════════════════════════════════════════════════"

if [ -z "$TOKEN" ]; then
  echo "❌ Token requis pour cet endpoint"
else
  curl -X GET "$API_URL/api/dashboard/stats" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -w "\nStatus: %{http_code}\n" \
    -s | jq '.' 2>/dev/null || cat
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "3. Test GET /api/dashboard/recent"
echo "═══════════════════════════════════════════════════"

if [ -z "$TOKEN" ]; then
  echo "❌ Token requis pour cet endpoint"
else
  curl -X GET "$API_URL/api/dashboard/recent" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -w "\nStatus: %{http_code}\n" \
    -s | jq '.' 2>/dev/null || cat
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "4. Test GET /api/users/me"
echo "═══════════════════════════════════════════════════"

if [ -z "$TOKEN" ]; then
  echo "❌ Token requis pour cet endpoint"
else
  curl -X GET "$API_URL/api/users/me" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -w "\nStatus: %{http_code}\n" \
    -s | jq '.' 2>/dev/null || cat
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Tests terminés"
echo "═══════════════════════════════════════════════════"

