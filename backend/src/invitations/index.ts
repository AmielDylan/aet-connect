import { supabase } from '@/config/database'
import { config } from '@/config/environment'
import { createInvitations } from './invitations'
import { ManualDeliveryMailer } from './mailer'

export { createInvitations, InvitationError, QUOTA, defaultQuota } from './invitations'
export type {
  Invitations, IssuedCode, IssueOptions, Promo, InvitationErrorReason, CheckResult, CodeRefusal, Grant
} from './invitations'
export { InMemoryMailer, ManualDeliveryMailer } from './mailer'
export type { Mailer, InvitationEmail } from './mailer'
export { sendInvitationError } from './http'

/**
 * Instance utilisée par l'application.
 * Emails : transmission manuelle par l'admin tant qu'aucun domaine d'envoi n'est vérifié
 * (remplacer ManualDeliveryMailer par un adapter Resend à ce moment-là).
 */
export const invitations = createInvitations({
  db: supabase,
  mailer: new ManualDeliveryMailer(),
  appUrl: config.frontendUrl
})
