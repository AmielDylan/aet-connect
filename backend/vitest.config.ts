import { defineConfig } from 'vitest/config'
import path from 'path'

// Tests sur la base Supabase LOCALE uniquement (voir tests/assert-local.ts).
// Lancer : doppler run -- npm run test:unit
export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') }
  },
  test: {
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: ['tests/assert-local.ts'],
    testTimeout: 20000,
    hookTimeout: 20000
  }
})
