import { randomInt } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Mailer, InvitationEmail } from './mailer'
import { ambassadeurDeLaPromo, nomComplet } from '@/utils/ambassadeurs'

export interface Promo {
  schoolId: string
  entryYear: string
}

export interface IssuedCode {
  id: string
  code: string
  /** null = code universel */
  promo: Promo | null
  maxUses: number
  expiresAt: Date
  /** Présent quand le code répond à une demande d'accès. sent=false : à transmettre à la main. */
  delivery?: { sent: boolean; email: InvitationEmail }
}

/** Options réservées aux admins. Un membre émet toujours pour sa promo, un usage. */
export interface IssueOptions {
  promo?: Promo | 'universal'
  maxUses?: number
  /** Approuve cette demande d'accès : code pour sa promo, envoyé au demandeur. */
  accessRequestId?: string
  /** Avec accessRequestId : la personne deviendra ambassadrice en s'inscrivant. */
  grantsAmbassador?: boolean
}

export type CodeRefusal = 'unknown' | 'revoked' | 'expired' | 'exhausted'

export type CheckResult =
  | { valid: true; code: string; promo: Promo | null; schoolName: string | null; grantsAmbassador: boolean }
  | { valid: false; reason: CodeRefusal }

/** Ce que le code accorde à la personne qui s'inscrit. */
export interface Grant {
  promo: Promo
  grantsAmbassador: boolean
}

export interface Invitations {
  issue(issuerId: string, options?: IssueOptions): Promise<IssuedCode>
  /** Saisie tolérante : casse, espaces et tirets ignorés. */
  check(code: string): Promise<CheckResult>
  /**
   * Consomme le code et crée le compte avec `createAccount` (qui renvoie l'id du membre).
   * Si `createAccount` échoue, le code est rendu. `promo` n'est lu que pour un code universel.
   */
  redeem(code: string, choice: { promo?: Promo }, createAccount: (grant: Grant) => Promise<string>): Promise<{ memberId: string }>
  /** Révoque un code non utilisé. Son émetteur ou un admin uniquement. */
  revoke(memberId: string, codeId: string): Promise<void>
  /** limit/remaining à null : pas de limite (admin). */
  quota(memberId: string): Promise<{ limit: number | null; used: number; remaining: number | null }>
}

export const QUOTA = { alumni: 3, ambassador: 15 } as const

/** Quota par défaut d'un membre selon son rôle. null = illimité. */
export function defaultQuota(member: { role: string; isAmbassador: boolean }): number | null {
  if (member.role === 'admin') return null
  return member.isAmbassador ? QUOTA.ambassador : QUOTA.alumni
}

export type InvitationErrorReason =
  | 'quota_reached' | 'not_allowed' | 'promo_required' | 'not_owner' | 'already_used'
  | 'request_not_pending' | 'promo_has_ambassador' | CodeRefusal

export class InvitationError extends Error {
  constructor(readonly reason: InvitationErrorReason, message: string) {
    super(message)
    this.name = 'InvitationError'
  }
}

type Deps = {
  db: SupabaseClient
  mailer: Mailer
  /** URL publique du frontend, pour le lien d'inscription des emails. */
  appUrl: string
}

function invitationEmail(args: {
  to: string; firstName: string; schoolName: string; entryYear: string; code: string; expiresAt: Date; appUrl: string
}): InvitationEmail {
  const until = args.expiresAt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  return {
    to: args.to,
    subject: 'Votre invitation à AET Connect',
    text: [
      `Bonjour ${args.firstName},`,
      '',
      `Votre demande d'accès à AET Connect (${args.schoolName}, promo ${args.entryYear}) est acceptée.`,
      '',
      `Votre code d'invitation : ${args.code}`,
      `Il est valable jusqu'au ${until}.`,
      '',
      `Pour vous inscrire : ${args.appUrl}/register/with-code?code=${args.code}`,
      '',
      "L'équipe AET Connect"
    ].join('\n')
  }
}

const VALIDITY_DAYS = 30
// Sans 0/O, 1/I/L : un code se dicte et se recopie depuis un SMS sans ambiguïté
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generateCode(): string {
  const block = () => Array.from({ length: 4 }, () => ALPHABET[randomInt(ALPHABET.length)]).join('')
  return `AET-${block()}-${block()}`
}

/** « aet abcd efgh » → « AET-ABCD-EFGH ». Les anciens formats sont seulement mis en majuscules. */
function normalize(input: string): string {
  const compact = input.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (/^AET[A-Z0-9]{8}$/.test(compact)) return `AET-${compact.slice(3, 7)}-${compact.slice(7)}`
  return input.trim().toUpperCase()
}

const REFUSAL_MESSAGES: Record<CodeRefusal, string> = {
  unknown: 'Code invalide ou inexistant.',
  revoked: 'Ce code a été révoqué.',
  expired: 'Ce code a expiré.',
  exhausted: 'Ce code a déjà été utilisé.'
}

function refusal(reason: CodeRefusal) {
  return new InvitationError(reason, REFUSAL_MESSAGES[reason])
}

export function createInvitations({ db, mailer, appUrl }: Deps): Invitations {
  async function quotaUsed(memberId: string): Promise<number> {
    const { data, error } = await db.rpc('invitation_quota_used', { p_member_id: memberId })
    if (error) throw error
    return data
  }

  return {
    async quota(memberId) {
      const { data: member, error } = await db.from('users').select('role, max_codes_allowed').eq('id', memberId).single()
      if (error) throw error
      const used = await quotaUsed(memberId)
      if (member.role === 'admin') return { limit: null, used, remaining: null }
      const limit = member.max_codes_allowed
      return { limit, used, remaining: Math.max(limit - used, 0) }
    },

    async revoke(memberId, codeId) {
      const [{ data: row, error }, { data: member, error: memberError }] = await Promise.all([
        db.from('invitation_codes').select('id, created_by_user_id, current_uses').eq('id', codeId).maybeSingle(),
        db.from('users').select('role').eq('id', memberId).single()
      ])
      if (error) throw error
      if (memberError) throw memberError
      if (!row) throw refusal('unknown')
      if (row.created_by_user_id !== memberId && member.role !== 'admin') {
        throw new InvitationError('not_owner', 'Ce code ne vous appartient pas.')
      }
      if (row.current_uses > 0) {
        throw new InvitationError('already_used', 'Ce code a déjà servi, il ne peut plus être révoqué.')
      }

      // current_uses = 0 dans le filtre : une inscription concurrente ne peut pas être annulée
      const { error: updateError } = await db
        .from('invitation_codes')
        .update({ is_active: false })
        .eq('id', codeId)
        .eq('current_uses', 0)
      if (updateError) throw updateError
    },

    async redeem(input, choice, createAccount) {
      const code = normalize(input)
      const { data, error } = await db.rpc('reserve_invitation_code', { p_code: code })
      if (error) {
        const reason = error.message.match(/^invitation:(\w+)$/)?.[1] as CodeRefusal | undefined
        if (reason) throw refusal(reason)
        throw error
      }
      const reserved = data[0] as { id: string; school_id: string | null; entry_year: string | null; grants_ambassador: boolean }

      const release = () => db.rpc('release_invitation_code', { p_code_id: reserved.id })

      const promo = reserved.school_id ? { schoolId: reserved.school_id, entryYear: reserved.entry_year! } : choice.promo
      if (!promo) {
        await release()
        throw new InvitationError('promo_required', 'Choisissez votre école et votre année d’entrée.')
      }

      let memberId: string
      try {
        memberId = await createAccount({ promo, grantsAmbassador: reserved.grants_ambassador })
      } catch (accountError) {
        await release()
        throw accountError
      }

      const { error: completeError } = await db.rpc('complete_invitation_redemption', {
        p_code_id: reserved.id,
        p_member_id: memberId,
        p_ambassador_quota: QUOTA.ambassador
      })
      if (completeError) throw completeError

      return { memberId }
    },

    async check(input) {
      const { data, error } = await db
        .from('invitation_codes')
        .select('code, school_id, entry_year, grants_ambassador, status:invitation_code_status, school:schools(name_fr)')
        .eq('code', normalize(input))
        .maybeSingle()
      if (error) throw error
      if (!data) return { valid: false, reason: 'unknown' }
      if (data.status !== 'valid') return { valid: false, reason: data.status as CodeRefusal }

      const school = Array.isArray(data.school) ? data.school[0] : data.school
      return {
        valid: true,
        code: data.code,
        promo: data.school_id ? { schoolId: data.school_id, entryYear: data.entry_year } : null,
        schoolName: school?.name_fr ?? null,
        grantsAmbassador: data.grants_ambassador
      }
    },

    async issue(issuerId, options = {}) {
      const { data: issuer, error } = await db
        .from('users')
        .select('id, school_id, entry_year, role, max_codes_allowed')
        .eq('id', issuerId)
        .single()
      if (error || !issuer) throw error ?? new Error('Membre introuvable')

      const isAdmin = issuer.role === 'admin'
      const adminOnly = [options.promo, options.maxUses, options.accessRequestId, options.grantsAmbassador]
      if (!isAdmin && adminOnly.some((o) => o !== undefined)) {
        throw new InvitationError('not_allowed', "Seul un administrateur peut choisir la promo, le nombre d'usages ou approuver une demande.")
      }

      if (options.accessRequestId) return approveAccessRequest(issuerId, options.accessRequestId, options.grantsAmbassador ?? false)

      if (!isAdmin) {
        if ((await quotaUsed(issuerId)) >= issuer.max_codes_allowed) {
          throw new InvitationError(
            'quota_reached',
            `Vous avez atteint votre limite de ${issuer.max_codes_allowed} codes.`
          )
        }
      }

      const promo: Promo | null =
        options.promo === 'universal' ? null
        : options.promo ?? { schoolId: issuer.school_id, entryYear: issuer.entry_year }
      return insertCode({ issuerId, isAdmin, promo, maxUses: options.maxUses ?? 1, grantsAmbassador: false })
    }
  }

  async function insertCode(args: {
    issuerId: string; isAdmin: boolean; promo: Promo | null; maxUses: number; grantsAmbassador: boolean
  }): Promise<IssuedCode> {
    const expiresAt = new Date(Date.now() + VALIDITY_DAYS * 24 * 60 * 60 * 1000)
    const { data: row, error } = await db
      .from('invitation_codes')
      .insert({
        code: generateCode(),
        school_id: args.promo?.schoolId ?? null,
        entry_year: args.promo?.entryYear ?? null,
        created_by_user_id: args.issuerId,
        is_admin_code: args.isAdmin,
        max_uses: args.maxUses,
        current_uses: 0,
        is_active: true,
        grants_ambassador: args.grantsAmbassador,
        expires_at: expiresAt.toISOString()
      })
      .select('id, code')
      .single()
    if (error) throw error
    return { id: row.id, code: row.code, promo: args.promo, maxUses: args.maxUses, expiresAt }
  }

  /** Un seul ambassadeur par promo : ni membre ambassadeur, ni code « ambassadeur » encore valable */
  async function verifierPromoSansAmbassadeur(promo: { schoolId: string; entryYear: string }) {
    const deja = await ambassadeurDeLaPromo(db, promo)
    if (deja) {
      throw new InvitationError('promo_has_ambassador', `${nomComplet(deja)} représente déjà cette promo.`)
    }
    const { data: codes, error } = await db
      .from('invitation_codes')
      .select('id, status:invitation_code_status')
      .eq('school_id', promo.schoolId)
      .eq('entry_year', promo.entryYear)
      .eq('grants_ambassador', true)
      .is('used_by_user_id', null)
    if (error) throw error
    if ((codes ?? []).some((c: { status: string }) => c.status === 'valid')) {
      throw new InvitationError('promo_has_ambassador', 'Un code d’ambassadeur pour cette promo attend déjà d’être utilisé.')
    }
  }

  async function approveAccessRequest(adminId: string, requestId: string, grantsAmbassador: boolean): Promise<IssuedCode> {
    const { data: request, error } = await db
      .from('access_requests')
      .select('id, status, email, first_name, school_id, entry_year, school:schools(name_fr)')
      .eq('id', requestId)
      .maybeSingle()
    if (error) throw error
    if (!request || request.status !== 'pending') {
      throw new InvitationError('request_not_pending', 'Cette demande a déjà été traitée.')
    }

    const promo = { schoolId: request.school_id, entryYear: request.entry_year }
    if (grantsAmbassador) await verifierPromoSansAmbassadeur(promo)
    const issued = await insertCode({ issuerId: adminId, isAdmin: true, promo, maxUses: 1, grantsAmbassador })

    // status = 'pending' dans le filtre : deux admins qui approuvent en même temps → un seul gagne
    const { data: approved, error: approveError } = await db
      .from('access_requests')
      .update({ status: 'approved', invitation_code_id: issued.id, processed_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('status', 'pending')
      .select('id')
    if (approveError) throw approveError
    if (!approved?.length) {
      await db.from('invitation_codes').delete().eq('id', issued.id)
      throw new InvitationError('request_not_pending', 'Cette demande a déjà été traitée.')
    }

    const school = Array.isArray(request.school) ? request.school[0] : request.school
    const email = invitationEmail({
      to: request.email,
      firstName: request.first_name,
      schoolName: school?.name_fr ?? 'votre école',
      entryYear: request.entry_year,
      code: issued.code,
      expiresAt: issued.expiresAt,
      appUrl
    })
    const sent = await mailer.send(email)
    return { ...issued, delivery: { sent, email } }
  }
}
