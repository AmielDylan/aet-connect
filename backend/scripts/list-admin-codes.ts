import { supabase } from '../src/config/database'
import { logger } from '../src/utils/logger'

async function listAdminCodes() {
  logger.info('Recherche des codes admin universels...\n')
  
  // Récupérer tous les codes admin actifs
  const { data: codes, error } = await supabase
    .from('invitation_codes')
    .select('code, is_admin_code, max_uses, current_uses, expires_at, is_active, created_at')
    .eq('is_admin_code', true)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) {
    logger.error('❌ Erreur lors de la récupération:', error)
    return
  }
  
  if (!codes || codes.length === 0) {
    logger.warn('⚠️  Aucun code admin trouvé dans la base de données.\n')
    logger.info('💡 Pour créer un code admin universel, utilisez:')
    logger.info('   npm run admin:create-code\n')
    return
  }
  
  logger.info(`✅ ${codes.length} code(s) admin trouvé(s):\n`)
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  codes.forEach((code, index) => {
    logger.info(`\n${index + 1}. Code: ${code.code}`)
    logger.info(`   Utilisations: ${code.current_uses}/${code.max_uses}`)
    logger.info(`   Expiration: ${code.expires_at || 'Aucune'}`)
    logger.info(`   Créé le: ${new Date(code.created_at).toLocaleDateString('fr-FR')}`)
    
    if (code.code.startsWith('ADMIN-UNIVERSAL')) {
      logger.info(`   🌍 Type: Code admin universel (valide pour toutes les écoles)`)
    }
  })
  
  logger.info('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  // Afficher le premier code universel disponible
  const universalCodes = codes.filter(c => c.code.startsWith('ADMIN-UNIVERSAL'))
  if (universalCodes.length > 0) {
    const availableCode = universalCodes.find(c => c.current_uses < c.max_uses) || universalCodes[0]
    logger.info('\n💡 Code admin universel disponible:')
    logger.info(`   ${availableCode.code}`)
    logger.info(`   Utilisations restantes: ${availableCode.max_uses - availableCode.current_uses}`)
    logger.info(`\n🔗 Lien d'inscription:`)
    logger.info(`   http://localhost:3000/register?code=${availableCode.code}\n`)
  }
}

listAdminCodes()

