import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

async function migrateEntryYear() {
  logger.info('🔄 Migration entry_year vers format YYYY...\n')

  // 1. Corriger les codes d'invitation avec entry_year à 2 chiffres
  logger.info('📋 Correction des codes d\'invitation...')

  const { data: codes, error: codesError } = await supabase
    .from('invitation_codes')
    .select('id, code, entry_year')

  if (codesError) {
    logger.error('❌ Erreur récupération codes:', codesError)
    return
  }

  const codesToUpdate = codes?.filter(c => c.entry_year && c.entry_year.length === 2) || []
  logger.info(`   Trouvé ${codesToUpdate.length} code(s) à corriger`)

  for (const code of codesToUpdate) {
    const oldYear = code.entry_year!
    let newYear = oldYear

    // Convertir YY → YYYY
    if (oldYear.length === 2) {
      const yearNum = parseInt(oldYear)
      // Si <= 50, c'est 20XX, sinon 19XX
      newYear = yearNum <= 50 ? `20${oldYear}` : `19${oldYear}`
    }

    logger.info(`   Code ${code.code}: "${oldYear}" → "${newYear}"`)

    const { error: updateError } = await supabase
      .from('invitation_codes')
      .update({ entry_year: newYear })
      .eq('id', code.id)

    if (updateError) {
      logger.error(`   ❌ Erreur mise à jour code ${code.code}:`, updateError)
    } else {
      logger.info(`   ✅ Code ${code.code} mis à jour`)
    }
  }

  // 2. Corriger les utilisateurs (au cas où)
  logger.info('\n👥 Correction des utilisateurs...')

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, entry_year')
    .not('entry_year', 'is', null)

  if (usersError) {
    logger.error('❌ Erreur récupération users:', usersError)
  } else {
    const usersToUpdate = users?.filter(u => u.entry_year && u.entry_year.length === 2) || []
    logger.info(`   Trouvé ${usersToUpdate.length} utilisateur(s) à corriger`)

    for (const user of usersToUpdate) {
      const oldYear = user.entry_year!
      const yearNum = parseInt(oldYear)
      const newYear = yearNum <= 50 ? `20${oldYear}` : `19${oldYear}`

      logger.info(`   User ${user.email}: "${oldYear}" → "${newYear}"`)

      const { error: updateError } = await supabase
        .from('users')
        .update({ entry_year: newYear })
        .eq('id', user.id)

      if (updateError) {
        logger.error(`   ❌ Erreur mise à jour user ${user.email}:`, updateError)
      } else {
        logger.info(`   ✅ User ${user.email} mis à jour`)
      }
    }
  }

  // 3. Corriger les demandes d'accès
  logger.info('\n📨 Correction des demandes d\'accès...')

  const { data: requests, error: requestsError } = await supabase
    .from('access_requests')
    .select('id, email, entry_year')

  if (requestsError) {
    logger.error('❌ Erreur récupération requests:', requestsError)
  } else {
    const requestsToUpdate = requests?.filter(r => r.entry_year && r.entry_year.length === 2) || []
    logger.info(`   Trouvé ${requestsToUpdate.length} demande(s) à corriger`)

    for (const request of requestsToUpdate) {
      const oldYear = request.entry_year!
      const yearNum = parseInt(oldYear)
      const newYear = yearNum <= 50 ? `20${oldYear}` : `19${oldYear}`

      logger.info(`   Request ${request.email}: "${oldYear}" → "${newYear}"`)

      const { error: updateError } = await supabase
        .from('access_requests')
        .update({ entry_year: newYear })
        .eq('id', request.id)

      if (updateError) {
        logger.error(`   ❌ Erreur mise à jour request ${request.email}:`, updateError)
      } else {
        logger.info(`   ✅ Request ${request.email} mis à jour`)
      }
    }
  }

  logger.info('\n✅ Migration terminée!')
  logger.info('\n📊 Vérification finale...')

  // Vérification
  const { data: finalCodes } = await supabase
    .from('invitation_codes')
    .select('entry_year')

  const invalid = finalCodes?.filter(c => c.entry_year && c.entry_year.length !== 4) || []

  if (invalid.length === 0) {
    logger.info('✅ Tous les entry_year sont au format YYYY (4 chiffres)')
  } else {
    logger.error(`❌ ${invalid.length} entry_year encore invalides`)
  }
}

migrateEntryYear()



