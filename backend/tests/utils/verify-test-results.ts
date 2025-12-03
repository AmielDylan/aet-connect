import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement AVANT d'importer database
config({ path: resolve(process.cwd(), '.env.local') })

import { supabase } from '../src/config/database.js'

async function verifyTestResults() {
  try {
    console.log('\n🔍 VÉRIFICATION POST-TESTS')
    console.log('='.repeat(80))
    
    // Vérifier les nouveaux utilisateurs
    console.log('\n📌 NOUVEAUX UTILISATEURS CRÉÉS:')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('first_name, last_name, email, entry_year')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (!usersError && users) {
      users.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name}`)
        console.log(`     Email: ${user.email}`)
        console.log(`     Année: ${user.entry_year}`)
        console.log('')
      })
    }
    
    // Vérifier les demandes d'accès
    console.log('📌 DEMANDES D\'ACCÈS RÉCENTES:')
    const { data: requests, error: requestsError } = await supabase
      .from('access_requests')
      .select(`
        first_name,
        last_name,
        entry_year,
        wants_ambassador,
        status,
        schools:school_id (
          name_fr
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (!requestsError && requests) {
      requests.forEach(req => {
        console.log(`   - ${req.first_name} ${req.last_name}`)
        console.log(`     École: ${req.schools?.name_fr || 'N/A'}`)
        console.log(`     Année: ${req.entry_year}`)
        console.log(`     Ambassadeur: ${req.wants_ambassador ? 'OUI' : 'NON'}`)
        console.log(`     Statut: ${req.status}`)
        console.log('')
      })
    }
    
    // Vérifier format entry_year
    console.log('📌 VÉRIFICATION FORMAT entry_year:')
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, entry_year')
    
    if (!allUsersError && allUsers) {
      const invalidYears = allUsers.filter(user => 
        !user.entry_year || user.entry_year.length !== 4
      )
      
      if (invalidYears.length === 0) {
        console.log('   ✅ Tous les entry_year sont au format YYYY')
      } else {
        console.log(`   ❌ ${invalidYears.length} utilisateurs avec format invalide:`)
        invalidYears.forEach(user => {
          console.log(`      - ${user.email}: "${user.entry_year}"`)
        })
      }
    }
    
    console.log('\n' + '='.repeat(80))
    
  } catch (error) {
    console.error('Erreur:', error)
  }
}

verifyTestResults()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
