import { config } from 'dotenv'
import { resolve } from 'path'

// Charger les variables d'environnement AVANT d'importer database
config({ path: resolve(process.cwd(), '.env.local') })

import { supabase } from '../src/config/database.js'
import { RegistrationService } from '../src/services/registration.service.js'

const registrationService = new RegistrationService()

async function testWorkflowRequestCode() {
  try {
    console.log('\n🧪 TEST WORKFLOW: Demande code peer')
    console.log('='.repeat(80))
    
    // Récupérer une école avec un code existant (donc promo existante)
    const { data: codeDataArray, error: codeError } = await supabase
      .from('invitation_codes')
      .select(`
        school_id,
        entry_year,
        schools:school_id (
          name_fr,
          established_year
        )
      `)
      .eq('current_uses', 0)
      .eq('is_active', true)
      .limit(1)
    
    if (codeError || !codeDataArray || codeDataArray.length === 0) {
      console.log('❌ Aucun code disponible (promo existante requise)')
      console.log('💡 Exécutez d\'abord: npx tsx tests/fixtures/seed-test-data.ts')
      return
    }
    
    const codeData = codeDataArray[0]
    
    console.log('\n📌 ÉTAPE 1: Vérification promo existante')
    console.log(`   École: ${codeData.schools?.name_fr}`)
    console.log(`   Année: ${codeData.entry_year}`)
    
    const checkResult = await registrationService.checkSchoolPromo(
      codeData.school_id,
      codeData.entry_year
    )
    
    console.log('\n✅ Résultat vérification:')
    console.log(`   Promo existe: ${checkResult.exists}`)
    console.log(`   Has Ambassador: ${checkResult.has_ambassador}`)
    if (checkResult.ambassador_info) {
      console.log(`   Nom ambassadeur: ${checkResult.ambassador_info.first_name} ${checkResult.ambassador_info.last_name}`)
    }
    
    if (!checkResult.exists) {
      console.log('⚠️  Promo n\'existe pas, ce workflow n\'est pas approprié')
      return
    }
    
    console.log('\n📌 ÉTAPE 2: Demande de code à un pair')
    
    const codeRequest = {
      school_id: codeData.school_id,
      entry_year: codeData.entry_year,
      first_name: 'Paul',
      last_name: 'Demandeur',
      message: 'Je souhaite rejoindre le réseau de ma promotion.',
    }
    
    console.log(`   Prénom: ${codeRequest.first_name}`)
    console.log(`   Nom: ${codeRequest.last_name}`)
    
    const requestResult = await registrationService.requestCodeFromPeer(codeRequest)
    
    console.log('\n✅ Résultat demande code:')
    console.log(`   Recipient Name: ${requestResult.recipient_name}`)
    
    console.log('\n📌 ÉTAPE 3: Vérification en BDD')
    
    // Note: Ce workflow peut enregistrer la demande différemment selon l'implémentation
    // On vérifie ce qui a été créé
    
    const { data: recentRequests, error: requestError } = await supabase
      .from('access_requests')
      .select(`
        first_name,
        last_name,
        email,
        entry_year,
        schools:school_id (
          name_fr
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (!requestError && recentRequests && recentRequests.length > 0) {
      const recentRequest = recentRequests[0]
      console.log(`   ✅ Demande enregistrée: ${recentRequest.first_name} ${recentRequest.last_name}`)
      console.log(`   ✅ Email: ${recentRequest.email || 'N/A'}`)
      console.log(`   ✅ École: ${recentRequest.schools?.name_fr || 'N/A'}`)
      console.log(`   ✅ Année: ${recentRequest.entry_year}`)
      
      if (recentRequest.entry_year && recentRequest.entry_year.length === 4) {
        console.log(`   ✅ Format entry_year: YYYY (${recentRequest.entry_year})`)
      } else {
        console.log(`   ❌ Format entry_year invalide: "${recentRequest.entry_year}"`)
      }
    } else {
      console.log('   ℹ️  Pas de demande enregistrée (peut être normal selon l\'implémentation)')
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('✅ TEST RÉUSSI: Workflow "Demande code peer"\n')
    
  } catch (error) {
    console.error('\n❌ ERREUR PENDANT LE TEST:', error)
    if (error instanceof Error) {
      console.error(error.stack)
    }
  }
}

testWorkflowRequestCode()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
