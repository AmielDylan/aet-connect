import { defineConfig } from '@playwright/test'

// Parcours de bout en bout sur la pile LOCALE : supabase start + backend + frontend.
// Lancer : npm run test:e2e   (Doppler fournit la config dev_backend aux tests)
// Le port 3100 évite le 3000, souvent pris par un autre projet.
const FRONT = 'http://localhost:3100'

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: FRONT,
    channel: 'chrome', // le Chrome installé : aucun navigateur à télécharger
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: [
    {
      command: 'cd ../backend && doppler run -c dev_backend -- env FRONTEND_URL=http://localhost:3100 npx tsx src/app.ts',
      url: 'http://localhost:3001/health',
      reuseExistingServer: true,
      timeout: 60_000
    },
    {
      // Build de production : chaque page est prête, pas de compilation à la première visite
      // env -u NODE_ENV : les tests héritent de NODE_ENV=development (config dev_backend),
      // qui casse un build de production Next.js
      command: "env -u NODE_ENV doppler run -c dev_frontend -- sh -c 'npx next build && npx next start -p 3100'",
      url: `${FRONT}/login`,
      reuseExistingServer: true,
      timeout: 300_000
    }
  ]
})
