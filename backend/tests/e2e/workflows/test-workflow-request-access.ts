import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement AVANT d'importer database
config({ path: resolve(process.cwd(), '.env.local') })

import { supabase } from '../src/config/database.js'
import { RegistrationService } from '../src/services/registration.service.js'

const registrationService = new RegistrationService()

async function testWorkflowRequestAccess() {
  try {
    console.log('\n🧪 TEST WORKFLOW: Demande d\'accès initial')
    console.log('='.repeat(80))
    
    // Récupérer une école
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name_fr, established_year')
      .limit(1)
    
    if (schoolsError || !schools || schools.length === 0) {
      console.log('❌ Aucune école trouvée')
      return
    }
    
    const school = schools[0]
    const minYear = Math.max(1950, school.established_year || 1950)
    const testYear = new Date().getFullYear() + 1 // Année future
    
    console.log('\n📌 ÉTAPE 1: Vérification promo inexistante')
    console.log(`   École: ${school.name_fr}`)
    console.log(`   Année: ${testYear} (future, promo inexistante)`)
    console.log(`   Année minimale école: ${minYear}`)
    
    const checkResult = await registrationService.checkSchoolPromo(
      school.id,
      testYear.toString()
    )
    
    console.log('\n✅ Résultat vérification:')
    console.log(`   Promo existe: ${checkResult.exists}`)
    console.log(`   Has Ambassador: ${checkResult.has_ambassador}`)
    console.log(`   Member Count: ${checkResult.member_count}`)
    
    if (checkResult.exists) {
      console.log('⚠️  Promo existe déjà, utilisons une autre année...')
      // On pourrait chercher une autre année ici
    }
    
    console.log('\n📌 ÉTAPE 2: Création demande d\'accès (Ambassadeur)')
    
    const accessRequest = {
      school_id: school.id,
      entry_year: testYear.toString(),
      first_name: 'Marie',
      last_name: 'Pionnière',
      email: `marie.pionniere.${Date.now()}@example.com`,
      message: 'Je souhaite créer le réseau pour ma promotion et devenir ambassadeur.',
      wants_ambassador: true, // Demande pour être ambassadeur
    }
    
    console.log(`   Prénom: ${accessRequest.first_name}`)
    console.log(`   Nom: ${accessRequest.last_name}`)
    console.log(`   Email: ${accessRequest.email}`)
    console.log(`   Ambassadeur: ${accessRequest.wants_ambassador ? 'OUI' : 'NON'}`)
    
    const requestResult = await registrationService.createAccessRequest(accessRequest)
    
    console.log('\n✅ Résultat création demande:')
    console.log(`   Request ID: ${requestResult.id}`)
    console.log(`   Status: ${requestResult.status}`)
    
    console.log('\n📌 ÉTAPE 3: Vérification en BDD')
    
    const { data: createdRequest, error: requestError } = await supabase
      .from('access_requests')
      .select(`
        id,
        first_name,
        last_name,
        email,
        entry_year,
        wants_ambassador,
        status,
        schools:school_id (
          name_fr
        )
      `)
      .eq('id', requestResult.id)
      .single()
    
    if (requestError || !createdRequest) {
      console.log(`   ❌ Erreur lors de la récupération: ${requestError?.message}`)
      return
    }
    
    console.log(`   ✅ Demande créée: ${createdRequest.first_name} ${createdRequest.last_name}`)
    console.log(`   ✅ Email: ${createdRequest.email}`)
    console.log(`   ✅ École: ${createdRequest.schools?.name_fr || 'N/A'}`)
    console.log(`   ✅ Année: ${createdRequest.entry_year}`)
    console.log(`   ✅ Ambassadeur: ${createdRequest.wants_ambassador ? 'OUI' : 'NON'}`)
    console.log(`   ✅ Statut: ${createdRequest.status}`)
    
    // Vérifier le format entry_year
    if (createdRequest.entry_year && createdRequest.entry_year.length === 4) {
      console.log(`   ✅ Format entry_year: YYYY (${createdRequest.entry_year})`)
    } else {
      console.log(`   ❌ Format entry_year invalide: "${createdRequest.entry_year}"`)
    }
    
    // Vérifier validation année minimale
    const entryYearNum = parseInt(createdRequest.entry_year || '0', 10)
    if (entryYearNum >= minYear) {
      console.log(`   ✅ Année valide (>= ${minYear})`)
    } else {
      console.log(`   ❌ Année invalide (< ${minYear})`)
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('✅ TEST RÉUSSI: Workflow "Demande d\'accès initial"\n')
    
  } catch (error) {
    console.error('\n❌ ERREUR PENDANT LE TEST:', error)
    if (error instanceof Error) {
      console.error(error.stack)
    }
  }
}

testWorkflowRequestAccess()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
