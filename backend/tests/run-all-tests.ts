#!/usr/bin/env node

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function runScript(scriptName: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    console.log(`\n${'='.repeat(80)}`)
    console.log(`▶️  Exécution: ${scriptName}`)
    console.log('='.repeat(80))
    
    const scriptPath = join(__dirname, scriptName)
    const child = spawn('npx', ['tsx', scriptPath], {
      stdio: 'inherit',
      shell: false,
      cwd: process.cwd(),
      env: { ...process.env }
    })
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${scriptName} terminé avec succès\n`)
        resolve()
      } else {
        console.log(`❌ ${scriptName} a échoué avec le code ${code}\n`)
        reject(new Error(`${scriptName} failed with code ${code}`))
      }
    })
    
    child.on('error', (error) => {
      console.error(`❌ Erreur lors de l'exécution de ${scriptName}:`, error)
      reject(error)
    })
  })
}

async function runAllTests() {
  console.log('\n🚀 SUITE DE TESTS COMPLÈTE - AET CONNECT')
  console.log('='.repeat(80))
  console.log('Cette suite va :')
  console.log('  1. Créer des données de test (codes d\'invitation)')
  console.log('  2. Tester le workflow "Inscription avec code"')
  console.log('  3. Tester le workflow "Demande d\'accès initial"')
  console.log('  4. Tester le workflow "Demande code peer"')
  console.log('  5. Vérifier les résultats en BDD')
  console.log('='.repeat(80))
  
  try {
    // 1. Seed des données
    await runScript('fixtures/seed-test-data.ts')
    
    // Pause de 2 secondes entre chaque test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 2. Test inscription avec code
    await runScript('e2e/workflows/test-workflow-with-code.ts')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 3. Test demande d'accès initial
    await runScript('e2e/workflows/test-workflow-request-access.ts')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 4. Test demande code peer
    await runScript('e2e/workflows/test-workflow-request-code.ts')
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 5. Vérification finale
    await runScript('utils/verify-test-results.ts')
    
    console.log('\n' + '='.repeat(80))
    console.log('🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !')
    console.log('='.repeat(80))
    console.log('\n✅ Résumé:')
    console.log('  - Codes d\'invitation créés')
    console.log('  - Workflow "Inscription avec code" ✓')
    console.log('  - Workflow "Demande d\'accès initial" ✓')
    console.log('  - Workflow "Demande code peer" ✓')
    console.log('  - Vérifications BDD ✓')
    console.log('\n💡 Vous pouvez maintenant tester manuellement sur le frontend:')
    console.log('  - http://localhost:3000/register\n')
    
  } catch (error) {
    console.error('\n' + '='.repeat(80))
    console.error('❌ LA SUITE DE TESTS A ÉCHOUÉ')
    console.error('='.repeat(80))
    console.error(error)
    process.exit(1)
  }
}

runAllTests()
