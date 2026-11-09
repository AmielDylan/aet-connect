import { randomUUID } from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { expect, type Page } from '@playwright/test'

// Mise en place des parcours : comptes et données créés par l'API admin de la base locale.
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false }
})

export const PASSWORD = 'Motdepasse123!'

export async function createSchool(): Promise<string> {
  const { data, error } = await admin
    .from('schools')
    .insert({ name_fr: `École e2e ${randomUUID().slice(0, 6)}`, city: 'Testville', country: 'Bénin' })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

/** Membre prêt à se connecter. privacy / profile : mise en place, comme le membre l'aurait fait. */
export async function createMember(opts: {
  firstName?: string
  lastName?: string
  schoolId?: string
  profile?: Record<string, unknown>
  privacy?: Record<string, boolean>
} = {}) {
  const schoolId = opts.schoolId ?? (await createSchool())
  const email = `e2e-${randomUUID()}@aetconnect.test`
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: {
      first_name: opts.firstName ?? 'Awa',
      last_name: opts.lastName ?? 'Diop',
      school_id: schoolId,
      entry_year: '2005'
    }
  })
  if (error || !data.user) throw error ?? new Error('createUser sans utilisateur')
  const id = data.user.id
  if (opts.profile) await admin.from('users').update(opts.profile).eq('id', id)
  if (opts.privacy) await admin.from('user_privacy_settings').update(opts.privacy).eq('user_id', id)
  return { id, email, schoolId }
}

/** Code d'invitation émis par un membre (mise en place directe, valable 30 jours). */
export async function createCode(memberId: string, schoolId: string): Promise<string> {
  const code = `AET-${randomUUID().slice(0, 4).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`
  const { error } = await admin.from('invitation_codes').insert({
    code, school_id: schoolId, entry_year: '2005', created_by_user_id: memberId,
    max_uses: 1, expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString()
  })
  if (error) throw error
  return code
}

export async function avatarUrlOf(memberId: string): Promise<string | null> {
  const { data } = await admin.from('users').select('avatar_url').eq('id', memberId).single()
  return data?.avatar_url ?? null
}

/** reload: false = remplir le formulaire déjà affiché, sans recharger l'appli (le cache survit). */
export async function login(page: Page, email: string, { reload = true } = {}) {
  if (reload) await page.goto('/login')
  else await expect(page).toHaveURL(/\/login/)
  await page.locator('input').nth(0).fill(email)
  await page.locator('input').nth(1).fill(PASSWORD)
  await page.locator('button[type="submit"]').click()
  await page.waitForURL(/\/dashboard/)
}

/** Nom affiché dans le menu du compte de l'en-tête. */
export async function headerName(page: Page): Promise<string> {
  await page.getByRole('button', { name: 'Menu du compte' }).click()
  const name = (await page.getByRole('menu').locator('p').first().textContent())?.trim() ?? ''
  await page.keyboard.press('Escape')
  return name
}

/** Déconnexion par le menu de l'en-tête, comme un membre. */
export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Menu du compte' }).click()
  await page.getByRole('menuitem', { name: 'Se déconnecter' }).click()
  await expect(page).toHaveURL(/\/(login)?$/)
}
