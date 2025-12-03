// ═══════════════════════════════════════════════════
// API CLIENT TEST SUITE
// Script de test pour valider toutes les méthodes
// ═══════════════════════════════════════════════════

import { apiClient } from '../../lib/api'

// Comptes de test
// Note: Ces comptes ne sont plus utilisés après migration vers Supabase Auth
// Les tests d'authentification doivent être mis à jour pour utiliser supabase.auth.signInWithPassword()
// const TEST_ADMIN = {
//   email: 'test.admin@aetconnect.com',
//   password: 'TestPass123!',
// }
// const TEST_MEMBER = {
//   email: 'test.membre@aetconnect.com',
//   password: 'TestPass123!',
// }

// Utility pour afficher les résultats
function logSuccess(method: string, data: unknown) {
  console.log('\n✅', method)
  console.log(JSON.stringify(data, null, 2))
}

function logError(method: string, error: unknown) {
  console.error('\n❌', method)
  console.error(error instanceof Error ? error.message : error)
}

function logSection(title: string) {
  console.log('\n' + '═'.repeat(60))
  console.log(title)
  console.log('═'.repeat(60))
}

// ═══════════════════════════════════════════════════
// TEST SUITE
// ═══════════════════════════════════════════════════

async function testApiClient() {
  console.log('🚀 Démarrage des tests du client API')
  console.log('Backend:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')

  // ═══════════════════════════════════════════════════
  // 1. AUTH TESTS - MEMBRE
  // ═══════════════════════════════════════════════════
  
  logSection('1. AUTHENTIFICATION - COMPTE MEMBRE')

  try {
    // Note: Login est maintenant géré par Supabase Auth côté client
    // Ce test doit être mis à jour pour utiliser supabase.auth.signInWithPassword()
    // Pour l'instant, on skip ce test
    logSuccess('login() - Membre (SKIPPED - Migration Supabase Auth)', {
      message: 'Login maintenant géré par Supabase Auth',
    })

    // Test getMe
    const meData = await apiClient.getMe()
    logSuccess('getMe()', meData)

    // Test getUserProfile
    const profileData = await apiClient.getUserProfile()
    logSuccess('getUserProfile()', profileData)

  } catch (error) {
    logError('Auth - Membre', error)
  }

  // ═══════════════════════════════════════════════════
  // 2. SCHOOLS TESTS
  // ═══════════════════════════════════════════════════
  
  logSection('2. ÉCOLES')

  try {
    const schools = await apiClient.getSchools()
    logSuccess('getSchools()', {
      total: schools.total,
      count: schools.schools.length,
      first_school: schools.schools[0],
    })

    // Test getSchoolById si on a des écoles
    if (schools.schools.length > 0) {
      const schoolId = schools.schools[0].id
      const school = await apiClient.getSchoolById(schoolId)
      logSuccess('getSchoolById()', school)

      // Test getSchoolStats
      const schoolStats = await apiClient.getSchoolStats(schoolId)
      logSuccess('getSchoolStats()', schoolStats)
    }
  } catch (error) {
    logError('Schools', error)
  }

  // ═══════════════════════════════════════════════════
  // 3. EVENTS TESTS
  // ═══════════════════════════════════════════════════
  
  logSection('3. ÉVÉNEMENTS')

  try {
    const events = await apiClient.getEvents()
    logSuccess('getEvents()', {
      count: events.length,
      first_event: events[0],
    })

    // Test getEventById si on a des événements
    if (events.length > 0) {
      const eventId = events[0].id
      const event = await apiClient.getEventById(eventId)
      logSuccess('getEventById()', event)
    }
  } catch (error) {
    logError('Events', error)
  }

  // ═══════════════════════════════════════════════════
  // 4. USERS TESTS
  // ═══════════════════════════════════════════════════
  
  logSection('4. UTILISATEURS')

  try {
    const users = await apiClient.getUsers()
    logSuccess('getUsers()', {
      count: users.length,
      first_user: users[0],
    })

    // Test getUserById
    if (users.length > 0) {
      const userId = users[0].id
      const user = await apiClient.getUserById(userId)
      logSuccess('getUserById()', user)
    }
  } catch (error) {
    logError('Users', error)
  }

  // ═══════════════════════════════════════════════════
  // 5. CODES TESTS
  // ═══════════════════════════════════════════════════
  
  logSection('5. CODES D\'INVITATION')

  try {
    const myCodes = await apiClient.getMyCodes()
    logSuccess('getMyCodes()', myCodes)
  } catch (error) {
    logError('Codes', error)
  }

  // ═══════════════════════════════════════════════════
  // 6. PRIVACY TESTS
  // ═══════════════════════════════════════════════════
  
  logSection('6. CONFIDENTIALITÉ')

  try {
    const privacy = await apiClient.getPrivacySettings()
    logSuccess('getPrivacySettings()', privacy)
  } catch (error) {
    logError('Privacy', error)
  }

  // ═══════════════════════════════════════════════════
  // 7. LOGOUT MEMBRE
  // ═══════════════════════════════════════════════════
  
  logSection('7. DÉCONNEXION - MEMBRE')

  try {
    // Note: Logout est maintenant géré par Supabase Auth côté client
    // Ce test doit être mis à jour pour utiliser supabase.auth.signOut()
    // Pour l'instant, on skip ce test
    logSuccess('logout() (SKIPPED - Migration Supabase Auth)', { message: 'Logout maintenant géré par Supabase Auth' })
  } catch (error) {
    logError('Logout - Membre', error)
  }

  // ═══════════════════════════════════════════════════
  // 8. AUTH TESTS - ADMIN
  // ═══════════════════════════════════════════════════
  
  logSection('8. AUTHENTIFICATION - COMPTE ADMIN')

  try {
    // Note: Login est maintenant géré par Supabase Auth côté client
    // Ce test doit être mis à jour pour utiliser supabase.auth.signInWithPassword()
    // Pour l'instant, on skip ce test
    logSuccess('login() - Admin (SKIPPED - Migration Supabase Auth)', {
      message: 'Login maintenant géré par Supabase Auth',
    })

    // Test admin stats
    const adminStats = await apiClient.getAdminStats()
    logSuccess('getAdminStats()', adminStats)

  } catch (error) {
    logError('Auth - Admin', error)
  }

  // ═══════════════════════════════════════════════════
  // 9. LOGOUT ADMIN
  // ═══════════════════════════════════════════════════
  
  logSection('9. DÉCONNEXION - ADMIN')

  try {
    // Note: Logout est maintenant géré par Supabase Auth côté client
    // Ce test doit être mis à jour pour utiliser supabase.auth.signOut()
    // Pour l'instant, on skip ce test
    logSuccess('logout() - Admin (SKIPPED - Migration Supabase Auth)', { message: 'Logout maintenant géré par Supabase Auth' })
  } catch (error) {
    logError('Logout - Admin', error)
  }

  // ═══════════════════════════════════════════════════
  // RÉSUMÉ
  // ═══════════════════════════════════════════════════
  
  logSection('✅ TESTS TERMINÉS')
  console.log('Tous les tests ont été exécutés.')
  console.log('Vérifiez les résultats ci-dessus.\n')
}

// Export pour utilisation
export { testApiClient }

// Exécution si appelé directement (pour tsx)
testApiClient().catch(console.error)

