import { randomUUID } from 'crypto'
import { test, expect } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { createCode, createMember, createSchool } from './support'

// Les trois parcours d'inscription, de bout en bout sur la pile locale.
const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const MOT_DE_PASSE = 'Bienvenue2026'

test('avec un code reçu par lien : le compte est créé, puis la connexion fonctionne', async ({ page }) => {
  const parrain = await createMember()
  const code = await createCode(parrain.id, parrain.schoolId)
  const email = `inscrit-${randomUUID()}@aetconnect.test`

  await page.goto(`/register/with-code?code=${code}`)
  // Le code du lien est vérifié tout seul : on arrive directement aux informations
  await expect(page.getByRole('heading', { name: 'Vos informations' })).toBeVisible()
  await expect(page.getByText(/Code valable · .*promo 2005/)).toBeVisible()
  await expect(page.getByText('Étape 2/3')).toBeVisible()

  await page.getByLabel('Prénom').fill('Koffi')
  await page.getByLabel('Nom', { exact: true }).fill('Mensah')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(MOT_DE_PASSE)
  await page.getByLabel('Confirmation').fill(MOT_DE_PASSE)
  await page.getByRole('button', { name: 'Créer mon compte' }).click()
  await expect(page.getByRole('heading', { name: 'Bienvenue dans la famille' })).toBeVisible()

  await page.getByRole('link', { name: 'Me connecter' }).click()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(MOT_DE_PASSE)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await page.waitForURL(/\/dashboard/)
})

test('demande de code : la demande est enregistrée pour les administrateurs', async ({ page }) => {
  const membre = await createMember()
  const email = `demande-${randomUUID()}@aetconnect.test`

  await page.goto(`/register/request-code?school=${membre.schoolId}&year=2005`)
  await expect(page.getByText('Des collègues de votre promo sont déjà inscrits')).toBeVisible()
  await page.getByLabel('Prénom').fill('Aïcha')
  await page.getByLabel('Nom', { exact: true }).fill('Traoré')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Quelques mots pour vous présenter').fill('Je suis de la promo 2005, je cherche mes collègues.')
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
  await expect(page.getByRole('heading', { name: 'C’est envoyé' })).toBeVisible()

  const { data } = await admin.from('access_requests').select('status, wants_ambassador, school_id').eq('email', email).single()
  expect(data).toMatchObject({ status: 'pending', wants_ambassador: false, school_id: membre.schoolId })
})

test('demande d’accès : la première personne d’une promo peut se proposer comme ambassadeur', async ({ page }) => {
  const schoolId = await createSchool()
  const email = `premier-${randomUUID()}@aetconnect.test`

  await page.goto(`/register/request-access?school=${schoolId}&year=2010`)
  await expect(page.getByText('Personne de votre promo n’est encore inscrit')).toBeVisible()
  await page.getByLabel('Prénom').fill('Moussa')
  await page.getByLabel('Nom', { exact: true }).fill('Keïta')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Quelques mots pour vous présenter').fill('Promo 2010, première personne à rejoindre.')
  await page.getByLabel(/ambassadeur ou l’ambassadrice/).check()
  await page.getByRole('button', { name: 'Envoyer ma demande' }).click()
  await expect(page.getByRole('heading', { name: 'C’est envoyé' })).toBeVisible()

  const { data } = await admin.from('access_requests').select('wants_ambassador').eq('email', email).single()
  expect(data?.wants_ambassador).toBe(true)
})

test('demande de code pour une promo sans membre : la page propose la demande d’accès', async ({ page }) => {
  const schoolId = await createSchool()
  await page.goto(`/register/request-code?school=${schoolId}&year=2012`)
  await expect(page.getByText(/Personne de cette promo n’est encore inscrit/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Demander l’accès' })).toHaveAttribute('href', `/register/request-access?school=${schoolId}&year=2012`)
})
