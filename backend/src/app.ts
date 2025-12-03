import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { config, validateConfig } from '@/config/environment'
import { testDatabaseConnection } from '@/config/database'
import { errorHandler, notFoundHandler } from '@/middleware/error.middleware'
import { requestLogger } from '@/middleware/logger.middleware'
import { logger } from '@/utils/logger'
import registrationRoutes from '@/routes/registration.routes'
import codesRoutes from '@/routes/codes.routes'
import authRoutes from '@/routes/auth.routes'
import eventsRoutes from '@/routes/events.routes'
import adminRoutes from '@/routes/admin.routes'
import schoolsRoutes from '@/routes/schools.routes'
import usersRoutes from '@/routes/users.routes'
import dashboardRoutes from '@/routes/dashboard.routes'

const app = express()

// Security & Parsing
app.use(helmet())
app.use(cors({
  origin: config.nodeEnv === 'development' 
    ? '*' 
    : ['https://aetconnect.com'], // Ajuster en production
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use(requestLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  })
})

// API Routes
app.use('/api/register', registrationRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/codes', codesRoutes)
app.use('/api/events', eventsRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/schools', schoolsRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Error handling (doit être en dernier)
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
async function startServer() {
  logger.info('🚀 Starting AET Connect Backend...')
  
  // 1. Validate configuration
  if (!validateConfig()) {
    logger.error('Configuration validation failed. Exiting...')
    process.exit(1)
  }
  
  // 2. Test database connection
  const dbConnected = await testDatabaseConnection()
  if (!dbConnected) {
    logger.error('Database connection failed. Exiting...')
    process.exit(1)
  }
  
  // 3. Start Express server
  app.listen(config.port, () => {
    logger.info(`✅ Server running on http://localhost:${config.port}`)
    logger.info(`📝 Environment: ${config.nodeEnv}`)
    logger.info(`🗄️  Database: Connected`)
    logger.info('\n📚 Available endpoints:')
    logger.info(`   GET  /health - Health check`)
    logger.info(`   POST /api/register/check-school-promo`)
    logger.info(`   POST /api/register/request-initial-access`)
    logger.info(`   POST /api/register/verify-invitation-code`)
    logger.info(`   POST /api/register/complete-registration`)
    logger.info(`   POST /api/register/request-code-from-peer`)
    logger.info(`   POST /api/auth/login - Connexion`)
    logger.info(`   POST /api/auth/logout - Déconnexion`)
    logger.info(`   POST /api/auth/refresh - Rafraîchir token`)
    logger.info(`   GET  /api/auth/me - Profil utilisateur`)
    logger.info(`   POST /api/codes/generate - Générer un code`)
    logger.info(`   GET  /api/codes/my-codes - Mes codes`)
    logger.info(`   POST /api/events - Créer événement`)
    logger.info(`   GET  /api/events - Liste événements`)
    logger.info(`   GET  /api/events/:id - Détails événement`)
    logger.info(`   PATCH /api/events/:id - Modifier événement`)
    logger.info(`   DELETE /api/events/:id - Supprimer événement`)
    logger.info(`   POST /api/events/:id/register - S'inscrire`)
    logger.info(`   DELETE /api/events/:id/unregister - Se désinscrire`)
    logger.info(`   GET  /api/admin/stats - Statistiques admin`)
    logger.info(`   GET  /api/admin/access-requests - Liste demandes`)
    logger.info(`   POST /api/admin/access-requests/:id/approve - Approuver demande`)
    logger.info(`   POST /api/admin/access-requests/:id/reject - Rejeter demande`)
    logger.info(`   GET  /api/admin/users - Liste utilisateurs`)
    logger.info(`   PATCH /api/admin/users/:id - Modifier utilisateur`)
    logger.info(`   POST /api/admin/users/:id/set-ambassador - Désigner ambassadeur`)
    logger.info(`   PATCH /api/admin/users/:id/increase-code-limit - Augmenter limite`)
    logger.info(`   GET  /api/admin/events - Liste TOUS les événements`)
    logger.info(`   GET  /api/admin/events/:id/participants - Participants (admin)`)
    logger.info(`   PATCH /api/admin/events/:id - Modifier événement (admin)`)
    logger.info(`   DELETE /api/admin/events/:id - Supprimer événement (admin)`)
    logger.info('\n💡 Ready to accept requests!\n')
  })
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...')
  process.exit(0)
})

startServer()

export default app

