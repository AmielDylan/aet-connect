import { config } from 'dotenv'
import { resolve } from 'path'
import { randomUUID } from 'crypto'

// Charger les variables d'environnement AVANT d'importer database
config({ path: resolve(process.cwd(), '.env.local') })

import { supabase } from '../src/config/database.js'
import { RegistrationService } from '../src/services/registration.service.js'

const registrationService = new RegistrationService()

async function testWorkflowWithCode() {
  try {
    console.log('\n🧪 TEST WORKFLOW: Inscription avec code')
    console.log('='.repeat(80))
    
    // 1. Récupérer un code admin non utilisé
    const { data: codeData, error: codeError } = await supabase
      .from('invitation_codes')
      .select(`
        code,
        school_id,
        entry_year,
        is_admin_code,
        schools:school_id (
          name_fr,
          established_year
        )
      `)
      .eq('current_uses', 0)
      .eq('is_admin_code', true)
      .eq('is_active', true)
      .limit(1)
      .single()
    
    if (codeError || !codeData) {
      console.log('❌ Aucun code admin disponible')
      console.log('💡 Exécutez d\'abord: npx tsx tests/seed-test-data.ts')
      return
    }
    
    const school = Array.isArray(codeData.schools) ? codeData.schools[0] : codeData.schools
    const code = {
      code: codeData.code,
      school_id: codeData.school_id,
      entry_year: codeData.entry_year,
      school_name: school?.name_fr,
      established_year: school?.established_year
    }
    
    console.log('\n📌 ÉTAPE 1: Vérification du code')
    console.log(`   Code: ${code.code}`)
    console.log(`   École: ${code.school_name}`)
    console.log(`   Année: ${code.entry_year}`)
    
    const verifyResult = await registrationService.verifyInvitationCode(
      code.code,
      code.school_id,
      code.entry_year
    )
    
    console.log('\n✅ Résultat vérification:')
    console.log(`   Valid: ${verifyResult.valid}`)
    console.log(`   Message: ${verifyResult.message}`)
    console.log(`   School ID: ${verifyResult.school_id}`)
    console.log(`   Entry Year: ${verifyResult.entry_year}`)
    console.log(`   School Name: ${verifyResult.school_name}`)
    
    if (!verifyResult.valid) {
      console.log('❌ Code invalide, arrêt du test')
      return
    }
    
    // Vérifier que school_name est bien retourné
    if (!verifyResult.school_name) {
      console.log('⚠️  WARNING: school_name n\'est pas retourné par l\'API')
    } else {
      console.log(`✅ school_name retourné: "${verifyResult.school_name}"`)
    }
    
    console.log('\n📌 ÉTAPE 2: Création du compte')
    
    const testUser = {
      invitation_code: code.code,
      first_name: 'Jean',
      last_name: 'Testeur',
      email: `jean.testeur.${Date.now()}@example.com`,
      password: 'TestPass123!',
    }
    
    console.log(`   Prénom: ${testUser.first_name}`)
    console.log(`   Nom: ${testUser.last_name}`)
    console.log(`   Email: ${testUser.email}`)
    
    const registrationResult = await registrationService.completeRegistration(testUser)
    
    console.log('\n✅ Résultat inscription:')
    console.log(`   User ID: ${registrationResult.user_id}`)
    
    console.log('\n📌 ÉTAPE 3: Vérification en BDD')
    
    const { data: createdUser, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        entry_year,
        schools:school_id (
          name_fr
        )
      `)
      .eq('id', registrationResult.user_id)
      .single()
    
    if (userError || !createdUser) {
      console.log(`   ❌ Erreur lors de la récupération: ${userError?.message}`)
      return
    }
    
    console.log(`   ✅ Utilisateur créé: ${createdUser.first_name} ${createdUser.last_name}`)
    console.log(`   ✅ Email: ${createdUser.email}`)
    const userSchool = Array.isArray(createdUser.schools) ? createdUser.schools[0] : createdUser.schools
    console.log(`   ✅ École: ${userSchool?.name_fr || 'N/A'}`)
    console.log(`   ✅ Année: ${createdUser.entry_year}`)
    
    // Vérifier le format entry_year
    if (createdUser.entry_year && createdUser.entry_year.length === 4) {
      console.log(`   ✅ Format entry_year: YYYY (${createdUser.entry_year})`)
    } else {
      console.log(`   ❌ Format entry_year invalide: "${createdUser.entry_year}"`)
    }
    
    // Vérifier que le code est marqué comme utilisé
    const { data: usedCode, error: codeCheckError } = await supabase
      .from('invitation_codes')
      .select('current_uses, max_uses')
      .eq('code', code.code)
      .single()
    
    if (!codeCheckError && usedCode) {
      if (usedCode.current_uses > 0) {
        console.log(`   ✅ Code utilisé (${usedCode.current_uses}/${usedCode.max_uses})`)
      } else {
        console.log(`   ⚠️  WARNING: Code non marqué comme utilisé`)
      }
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('✅ TEST RÉUSSI: Workflow "Inscription avec code"\n')
    
  } catch (error) {
    console.error('\n❌ ERREUR PENDANT LE TEST:', error)
    if (error instanceof Error) {
      console.error(error.stack)
    }
  }
}

testWorkflowWithCode()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
