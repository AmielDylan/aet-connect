#!/usr/bin/env tsx

/**
 * Script de test pour valider les endpoints API
 * Teste les endpoints avec Supabase Auth
 */

import { config } from '../src/config/environment.js'
import { supabase } from '../src/config/database.js'

const API_URL = `http://localhost:${config.port}`

// Couleurs pour la console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

async function createTestUser() {
  logSection('1. CRÉATION D\'UN UTILISATEUR DE TEST')

  const testEmail = `test-${Date.now()}@test.com`
  const testPassword = 'TestPass123!'

  try {
    // Note: Pour créer un utilisateur avec admin, il faut utiliser le service role key
    // Pour ce test, on va utiliser un utilisateur existant ou créer via l'API normale
    // Créer un client Supabase avec service role pour admin operations
    const { createClient } = await import('@supabase/supabase-js')
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Créer un utilisateur dans Supabase Auth avec admin
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    })

    if (authError || !authData.user) {
      log(`❌ Erreur création utilisateur Auth: ${authError?.message}`, 'red')
      log(`   Vérifiez que SUPABASE_SERVICE_ROLE_KEY est configuré`, 'yellow')
      return null
    }

    log(`✅ Utilisateur Auth créé: ${authData.user.id}`, 'green')

    // Créer l'utilisateur dans la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
        role: 'alumni',
        is_active: true,
      })
      .select()
      .single()

    if (userError) {
      log(`⚠️  Erreur création utilisateur dans users: ${userError.message}`, 'yellow')
      // L'utilisateur Auth existe, on peut continuer
    } else {
      log(`✅ Utilisateur créé dans users: ${userData.id}`, 'green')
    }

    return {
      id: authData.user.id,
      email: testEmail,
      password: testPassword,
    }
  } catch (error) {
    log(`❌ Erreur: ${error instanceof Error ? error.message : 'Unknown'}`, 'red')
    return null
  }
}

async function getAuthToken(email: string, password: string): Promise<string | null> {
  logSection('2. OBTENTION DU TOKEN AUTH')

  try {
    // Se connecter avec Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.session) {
      log(`❌ Erreur login: ${error?.message}`, 'red')
      return null
    }

    log(`✅ Token obtenu: ${data.session.access_token.substring(0, 20)}...`, 'green')
    return data.session.access_token
  } catch (error) {
    log(`❌ Erreur: ${error instanceof Error ? error.message : 'Unknown'}`, 'red')
    return null
  }
}

async function testEndpoints(token: string) {
  logSection('3. TEST DES ENDPOINTS API')

  // Test GET /api/auth/me
  log('\n📋 Test GET /api/auth/me')
  const meResult = await testEndpoint('GET', '/api/auth/me', token)
  if (meResult.success) {
    log(`✅ Status: ${meResult.status}`, 'green')
    log(`   User ID: ${meResult.data?.id}`)
    log(`   Email: ${meResult.data?.email}`)
  } else {
    log(`❌ Status: ${meResult.status}`, 'red')
    log(`   Error: ${meResult.error}`, 'red')
  }

  // Test GET /api/dashboard/stats
  log('\n📋 Test GET /api/dashboard/stats')
  const statsResult = await testEndpoint('GET', '/api/dashboard/stats', token)
  if (statsResult.success) {
    log(`✅ Status: ${statsResult.status}`, 'green')
    log(`   Stats: ${JSON.stringify(statsResult.data, null, 2)}`)
  } else {
    log(`❌ Status: ${statsResult.status}`, 'red')
    log(`   Error: ${statsResult.error}`, 'red')
  }

  // Test GET /api/dashboard/recent
  log('\n📋 Test GET /api/dashboard/recent')
  const recentResult = await testEndpoint('GET', '/api/dashboard/recent', token)
  if (recentResult.success) {
    log(`✅ Status: ${recentResult.status}`, 'green')
    log(`   Recent members: ${recentResult.data?.length || 0}`)
  } else {
    log(`❌ Status: ${recentResult.status}`, 'red')
    log(`   Error: ${recentResult.error}`, 'red')
  }

  // Test GET /api/users/me
  log('\n📋 Test GET /api/users/me')
  const profileResult = await testEndpoint('GET', '/api/users/me', token)
  if (profileResult.success) {
    log(`✅ Status: ${profileResult.status}`, 'green')
    log(`   Profile loaded: ${profileResult.data?.first_name} ${profileResult.data?.last_name}`)
  } else {
    log(`❌ Status: ${profileResult.status}`, 'red')
    log(`   Error: ${profileResult.error}`, 'red')
  }

  // Test sans token (devrait échouer)
  log('\n📋 Test GET /api/auth/me (sans token - devrait échouer)')
  const noTokenResult = await testEndpoint('GET', '/api/auth/me')
  if (!noTokenResult.success) {
    log(`✅ Status: ${noTokenResult.status} (attendu)`, 'green')
    log(`   Error: ${noTokenResult.error}`)
  } else {
    log(`❌ Status: ${noTokenResult.status} (ne devrait pas réussir!)`, 'red')
  }
}

async function cleanupTestUser(userId: string) {
  logSection('4. NETTOYAGE')

  try {
    // Créer un client Supabase avec service role pour admin operations
    const { createClient } = await import('@supabase/supabase-js')
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Supprimer l'utilisateur Auth
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId)
    if (deleteError) {
      log(`⚠️  Erreur suppression Auth: ${deleteError.message}`, 'yellow')
    } else {
      log(`✅ Utilisateur Auth supprimé`, 'green')
    }
  } catch (error) {
    log(`⚠️  Erreur cleanup: ${error instanceof Error ? error.message : 'Unknown'}`, 'yellow')
  }
}

async function main() {
  log('\n🚀 DÉMARRAGE DES TESTS API', 'blue')
  log(`API URL: ${API_URL}`)
  log(`Backend port: ${config.port}`)

  // Vérifier que le backend est démarré
  try {
    const healthCheck = await fetch(`${API_URL}/api/health`).catch(() => null)
    if (!healthCheck || !healthCheck.ok) {
      log('\n⚠️  Le backend ne semble pas être démarré', 'yellow')
      log('   Assurez-vous que le backend est lancé avec: npm run dev', 'yellow')
      log('   Continuons quand même...\n', 'yellow')
    }
  } catch {
    // Ignorer
  }

  let testUser: { id: string; email: string; password: string } | null = null

  try {
    // Créer un utilisateur de test
    testUser = await createTestUser()
    if (!testUser) {
      log('\n❌ Impossible de créer un utilisateur de test', 'red')
      log('   Vérifiez la configuration Supabase', 'yellow')
      process.exit(1)
    }

    // Obtenir un token
    const token = await getAuthToken(testUser.email, testUser.password)
    if (!token) {
      log('\n❌ Impossible d\'obtenir un token', 'red')
      process.exit(1)
    }

    // Tester les endpoints
    await testEndpoints(token)

    log('\n✅ TOUS LES TESTS TERMINÉS', 'green')
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error instanceof Error ? error.message : 'Unknown'}`, 'red')
    console.error(error)
  } finally {
    // Nettoyer
    if (testUser) {
      await cleanupTestUser(testUser.id)
    }
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

