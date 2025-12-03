import { config } from 'dotenv'
import { resolve } from 'path'
import { randomUUID } from 'crypto'

// Charger les variables d'environnement AVANT d'importer database
config({ path: resolve(process.cwd(), '.env.local') })

import { supabase } from '../src/config/database.js'

async function seedTestData() {
  try {
    console.log('\n🌱 SEED DES DONNÉES DE TEST')
    console.log('='.repeat(80))
    
    // Récupérer les écoles disponibles
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name_fr, established_year')
      .order('name_fr', { ascending: true })
    
    if (schoolsError) {
      throw schoolsError
    }
    
    if (!schools || schools.length === 0) {
      console.log('❌ Aucune école trouvée en BDD')
      return
    }
    
    console.log(`\n📚 ${schools.length} écoles trouvées`)
    
    // Sélectionner 2-3 écoles pour les tests
    const testSchools = schools.slice(0, Math.min(3, schools.length))
    
    const codes: Array<{
      id: string
      code: string
      school_id: string
      entry_year: string
      is_admin_code: boolean
      current_uses: number
      max_uses: number
      created_by_user_id: string | null
      is_active: boolean
      expires_at: string | null
    }> = []
    
    // Pour chaque école de test
    for (const school of testSchools) {
      const minYear = Math.max(1950, school.established_year || 1950)
      const testYear = Math.max(minYear, 2000) // Utiliser 2000 ou l'année minimale
      
      console.log(`\n📍 École: ${school.name_fr}`)
      console.log(`   Année minimale: ${minYear}`)
      console.log(`   Année de test: ${testYear}`)
      
      // 1. Créer un CODE ADMIN pour cette école
      const adminCode = `ADMIN-${school.name_fr.substring(0, 3).toUpperCase()}-${testYear}`
      const adminCodeData = {
        id: randomUUID(),
        code: adminCode,
        school_id: school.id,
        entry_year: testYear.toString(),
        is_admin_code: true,
        current_uses: 0,
        max_uses: 1,
        created_by_user_id: null, // Pas de créateur pour les codes de seed
        is_active: true,
        expires_at: null
      }
      
      codes.push(adminCodeData)
      console.log(`   ✅ Code admin: ${adminCode}`)
      
      // 2. Créer un CODE MEMBRE pour une promo existante (2000)
      const memberCode = `MEMBER-${school.name_fr.substring(0, 3).toUpperCase()}-${testYear}-TEST`
      const memberCodeData = {
        id: randomUUID(),
        code: memberCode,
        school_id: school.id,
        entry_year: testYear.toString(),
        is_admin_code: false,
        current_uses: 0,
        max_uses: 1,
        created_by_user_id: null,
        is_active: true,
        expires_at: null
      }
      
      codes.push(memberCodeData)
      console.log(`   ✅ Code membre: ${memberCode}`)
    }
    
    // 3. Créer un CODE ADMIN UNIVERSEL
    const universalCode = {
      id: randomUUID(),
      code: 'ADMIN-UNIVERSAL-TEST',
      school_id: testSchools[0].id,
      entry_year: '2000',
      is_admin_code: true,
      current_uses: 0,
      max_uses: 10, // Peut être utilisé plusieurs fois
      created_by_user_id: null,
      is_active: true,
      expires_at: null
    }
    
    codes.push(universalCode)
    console.log(`\n✅ Code universel: ADMIN-UNIVERSAL-TEST (10 utilisations)`)
    
    // Nettoyer les anciens codes de test
    console.log(`\n🧹 Nettoyage des anciens codes de test...`)
    const testCodes = codes.map(c => c.code)
    const { error: deleteError } = await supabase
      .from('invitation_codes')
      .delete()
      .in('code', testCodes)
    
    if (deleteError) {
      console.log(`⚠️  Avertissement lors du nettoyage: ${deleteError.message}`)
    } else {
      console.log(`✅ Anciens codes nettoyés`)
    }
    
    // Insérer tous les codes en BDD
    console.log(`\n💾 Insertion de ${codes.length} codes en BDD...`)
    
    const { error: insertError } = await supabase
      .from('invitation_codes')
      .insert(codes)
    
    if (insertError) {
      throw insertError
    }
    
    console.log('✅ Codes insérés avec succès')
    
    // Afficher un résumé
    console.log('\n' + '='.repeat(80))
    console.log('📋 RÉSUMÉ DES CODES CRÉÉS:')
    console.log('='.repeat(80))
    
    for (const code of codes) {
      const school = testSchools.find(s => s.id === code.school_id)
      console.log(`\n🎫 ${code.code}`)
      console.log(`   Type: ${code.is_admin_code ? 'ADMIN' : 'MEMBRE'}`)
      console.log(`   École: ${school?.name_fr}`)
      console.log(`   Année: ${code.entry_year}`)
      console.log(`   Max utilisations: ${code.max_uses}`)
    }
    
    console.log('\n' + '='.repeat(80))
    console.log('✅ SEED TERMINÉ\n')
    
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error)
    throw error
  }
}

seedTestData()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
