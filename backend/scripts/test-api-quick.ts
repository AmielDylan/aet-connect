#!/usr/bin/env tsx

/**
 * Script de test rapide pour valider les endpoints API avec Supabase Auth
 * Utilise un utilisateur existant ou crée un token de test
 */

import { config } from '../src/config/environment.js'
import { createClient } from '@supabase/supabase-js'

const API_URL = `http://localhost:${config.port}`

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title: string) {
  console.log('\n' + '═'.repeat(60))
  log(title, 'blue')
  console.log('═'.repeat(60))
}

async function testEndpoint(
  method: string,
  endpoint: string,
  token?: string,
  body?: any
): Promise<{ success: boolean; status: number; data?: any; error?: string }> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const options: RequestInit = {
      method,
      headers,
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${API_URL}${endpoint}`, options)
    const data = await response.json().catch(() => ({ error: 'Invalid JSON response' }))

    return {
      success: response.ok,
      status: response.status,
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.error || data.message || 'Unknown error',
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

async function getTokenFromCredentials(email: string, password: string): Promise<string | null> {
  logSection('OBTENTION DU TOKEN SUPABASE AUTH')

  try {
    // Créer un client Supabase côté client (anon key)
    const supabaseClient = createClient(
      config.supabase.url,
      config.supabase.anonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )

    // Se connecter avec Supabase Auth
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      log(`❌ Erreur login: ${error?.message}`, 'red')
      return null
    }

    log(`✅ Token obtenu`, 'green')
    log(`   User ID: ${data.user.id}`, 'cyan')
    log(`   Email: ${data.user.email}`, 'cyan')
    return data.session.access_token
  } catch (error) {
    log(`❌ Erreur: ${error instanceof Error ? error.message : 'Unknown'}`, 'red')
    return null
  }
}

async function testAllEndpoints(token: string) {
  logSection('TEST DES ENDPOINTS API')

  const endpoints = [
    { method: 'GET', path: '/api/auth/me', name: 'GET /api/auth/me' },
    { method: 'GET', path: '/api/dashboard/stats', name: 'GET /api/dashboard/stats' },
    { method: 'GET', path: '/api/dashboard/recent', name: 'GET /api/dashboard/recent' },
    { method: 'GET', path: '/api/users/me', name: 'GET /api/users/me' },
  ]

  let successCount = 0
  let failCount = 0

  for (const endpoint of endpoints) {
    log(`\n📋 Test ${endpoint.name}`)
    const result = await testEndpoint(endpoint.method, endpoint.path, token)

    if (result.success) {
      log(`   ✅ Status: ${result.status}`, 'green')
      if (result.data) {
        // Afficher un résumé des données
        if (endpoint.path === '/api/dashboard/stats') {
          log(`   📊 Stats:`, 'cyan')
          log(`      - Ma promo: ${result.data.myPromoCount}`, 'cyan')
          log(`      - Mon école: ${result.data.mySchoolCount}`, 'cyan')
          log(`      - Total réseau: ${result.data.totalNetworkCount}`, 'cyan')
        } else if (endpoint.path === '/api/dashboard/recent') {
          log(`   👥 Membres récents: ${Array.isArray(result.data) ? result.data.length : 0}`, 'cyan')
        } else if (endpoint.path === '/api/auth/me' || endpoint.path === '/api/users/me') {
          log(`   👤 User: ${result.data.first_name} ${result.data.last_name}`, 'cyan')
          log(`   📧 Email: ${result.data.email}`, 'cyan')
        }
      }
      successCount++
    } else {
      log(`   ❌ Status: ${result.status}`, 'red')
      log(`   ⚠️  Error: ${result.error}`, 'yellow')
      failCount++
    }
  }

  logSection('RÉSUMÉ DES TESTS')
  log(`✅ Succès: ${successCount}`, 'green')
  log(`❌ Échecs: ${failCount}`, failCount > 0 ? 'red' : 'green')
  log(`📊 Total: ${endpoints.length}`)
}

async function main() {
  log('\n🚀 TEST RAPIDE DES ENDPOINTS API', 'blue')
  log(`API URL: ${API_URL}`)
  log(`Backend port: ${config.port}`)

  // Vérifier que le backend est démarré
  try {
    const healthCheck = await fetch(`${API_URL}/health`).catch(() => null)
    if (!healthCheck || !healthCheck.ok) {
      log('\n⚠️  Le backend ne semble pas être démarré', 'yellow')
      log('   Assurez-vous que le backend est lancé avec: npm run dev', 'yellow')
      log('   Continuons quand même...\n', 'yellow')
    } else {
      log('✅ Backend détecté', 'green')
    }
  } catch {
    // Ignorer
  }

  // Utiliser les arguments de ligne de commande ou des valeurs par défaut
  const args = process.argv.slice(2)
  const email = args[0] || process.env.TEST_EMAIL || ''
  const password = args[1] || process.env.TEST_PASSWORD || ''

  if (!email || !password) {
    log('\n📝 Usage:', 'cyan')
    log('   npx tsx scripts/test-api-quick.ts <email> <password>', 'yellow')
    log('   ou définir TEST_EMAIL et TEST_PASSWORD dans .env.local', 'yellow')
    log('\n   Exemple:', 'cyan')
    log('   npx tsx scripts/test-api-quick.ts test.admin@aetconnect.com TestPass123!', 'yellow')
    process.exit(1)
  }

  try {
    log(`\n📝 Utilisation des credentials: ${email}`, 'cyan')

    // Obtenir le token
    const token = await getTokenFromCredentials(email, password)
    if (!token) {
      log('\n❌ Impossible d\'obtenir un token', 'red')
      log('   Vérifiez vos credentials et que Supabase est configuré', 'yellow')
      process.exit(1)
    }

    // Tester les endpoints
    await testAllEndpoints(token)

    log('\n✅ TESTS TERMINÉS', 'green')
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error instanceof Error ? error.message : 'Unknown'}`, 'red')
    console.error(error)
  }
}

// Exécuter les tests
main()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })

