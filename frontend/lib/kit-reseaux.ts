// Le kit réseaux sociaux : les thèmes, les textes à publier par réseau, les écoles, le calendrier et les messages
// d'invitation. Une seule source pour la page d'administration « Kit réseaux sociaux », le script qui génère les
// visuels (scripts/kit-reseaux.tsx) et le fichier communication/reseaux-sociaux/TEXTES.md.

export const SITE = 'aet-connect.vercel.app'
export const URL_SITE = `https://${SITE}`
export const HASHTAGS = '#AETConnect #EnfantsDeTroupe #AET'

export type Reseau = 'linkedin' | 'instagram' | 'whatsapp' | 'x'
export const RESEAUX: { id: Reseau; nom: string }[] = [
  { id: 'linkedin', nom: 'LinkedIn · Facebook' },
  { id: 'instagram', nom: 'Instagram' },
  { id: 'whatsapp', nom: 'WhatsApp' },
  { id: 'x', nom: 'X' },
]

export type GroupeKit = 'lancement' | 'promo' | 'ecoles' | 'ambassadeur' | 'entraide' | 'carrousel' | 'devise' | 'profils' | 'marque'

export type Theme = {
  id: GroupeKit
  titre: string
  /** Où et quand le publier */
  conseil?: string
  textes?: Record<Reseau, string>
}

/* ─────────── Les écoles (celles du site, avec leur sigle) ─────────── */

export const ECOLES_KIT = [
  { sigle: 'EMPT', nom: 'École Militaire Préparatoire Technique', ville: 'Bingerville', pays: 'Côte d’Ivoire', annee: 1962 },
  { sigle: 'PMS', nom: 'Prytanée militaire Charles N’Tchoréré de Saint-Louis', ville: 'Saint-Louis', pays: 'Sénégal', annee: 1973 },
  { sigle: 'CME', nom: 'Collège Militaire Eyadema', ville: 'Tchitchao', pays: 'Togo', annee: 1979 },
  { sigle: 'PMK (Kati)', nom: 'Prytanée militaire de Kati', ville: 'Kati', pays: 'Mali', annee: 1981 },
  { sigle: 'PMB', nom: 'Prytanée militaire de Bembéréké', ville: 'Bembéréké', pays: 'Bénin', annee: 1986 },
  { sigle: 'PMK', nom: 'Prytanée militaire de Kadiogo', ville: 'Kamboincè', pays: 'Burkina Faso', annee: 1992 },
  { sigle: 'PMN', nom: 'Prytanée militaire de Niamey', ville: 'Niamey', pays: 'Niger', annee: 1996 },
  { sigle: 'LMJF-GMK', nom: 'Lycée Militaire des Jeunes Filles Général Mathieu Kérékou', ville: 'Natitingou', pays: 'Bénin', annee: 2000 },
  { sigle: 'PML', nom: 'Prytanée Militaire de Libreville', ville: 'Libreville', pays: 'Gabon', annee: 2001 },
]
export type EcoleKit = (typeof ECOLES_KIT)[number]

/** Le nom de fichier d'une école : « PMK (Kati) » → « pmk-kati » */
export const fichierEcole = (sigle: string) =>
  sigle
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const motDiese = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]/g, '')

/** Les textes d'une école, pour son visuel */
export function textesEcole(e: EcoleKit): Record<Reseau, string> {
  const diese = `#AETConnect #EnfantsDeTroupe #${motDiese(e.sigle)} #${motDiese(e.pays)}`
  return {
    linkedin: `${e.sigle} · ${e.nom}, ${e.ville}, ${e.pays}.\n\nVos collègues de promotion vous attendent sur AET Connect, l’annuaire des Anciens Enfants de Troupe. Avec le code d’un collègue, ou en demandant un code :\n👉 ${URL_SITE}\n\n${diese}`,
    instagram: `${e.sigle} · ${e.nom}.\nVos collègues de promotion vous attendent sur AET Connect. Lien dans la bio.\n.\n${diese}`,
    whatsapp: `${e.sigle} (${e.ville}, ${e.pays}) : vos collègues de promotion vous attendent sur AET Connect, l’annuaire des Anciens Enfants de Troupe. ${URL_SITE}`,
    x: `${e.sigle} · ${e.ville}, ${e.pays} : vos collègues de promotion vous attendent sur AET Connect, l’annuaire des Anciens Enfants de Troupe. ${URL_SITE} #AETConnect #${motDiese(e.sigle)}`,
  }
}

/* ─────────── Les thèmes ─────────── */

export const THEMES: Theme[] = [
  {
    id: 'lancement',
    titre: 'Lancement',
    conseil: 'La première publication : le portrait dans le fil Instagram et Facebook, le paysage sur LinkedIn, la story le même jour.',
    textes: {
      linkedin: `AET un jour, AET toujours.\n\nAET Connect est en ligne : l’annuaire des Anciens Enfants de Troupe des prytanées et écoles militaires préparatoires d’Afrique de l’Ouest et centrale.\n\nVous y retrouvez vos collègues de promotion, école par école, et vous pouvez chercher un AET par pays ou par ville : pour un conseil, une mise en relation, un premier contact en arrivant quelque part.\n\nL’annuaire est sur invitation : chaque membre a été invité par un collègue de sa promotion ou validé par un administrateur.\n\n👉 ${URL_SITE}\n\n${HASHTAGS}`,
      instagram: `AET un jour, AET toujours.\nAET Connect, l’annuaire des Anciens Enfants de Troupe, est en ligne. Vos collègues de promotion vous y attendent, sur invitation.\nLien dans la bio.\n.\n${HASHTAGS} #Prytanée #EcoleMilitaire`,
      whatsapp: `AET un jour, AET toujours 🌞 AET Connect, l’annuaire des Anciens Enfants de Troupe, est en ligne. Vous pouvez y retrouver votre promo : ${URL_SITE}`,
      x: `AET un jour, AET toujours. AET Connect, l’annuaire des Anciens Enfants de Troupe, est en ligne : vos collègues de promotion vous y attendent, sur invitation. ${URL_SITE} #AETConnect #EnfantsDeTroupe`,
    },
  },
  {
    id: 'promo',
    titre: 'Votre promo vous attend',
    textes: {
      linkedin: `Votre promo vous attend.\n\nLes collègues entrés dans la même école la même année que vous se retrouvent sur AET Connect. Si l’un d’eux vous a envoyé un code, il suffit de le saisir. Sinon, vous pouvez demander un code en quelques secondes.\n\n👉 ${URL_SITE}\n\n${HASHTAGS}`,
      instagram: `Votre promo vous attend sur AET Connect. Un code reçu d’un collègue suffit pour la rejoindre ; sans code, vous pouvez en demander un. Lien dans la bio.\n.\n${HASHTAGS}`,
      whatsapp: `Votre promo vous attend sur AET Connect. Avec le code d’un collègue, ou en demandant un code : ${URL_SITE}`,
      x: `Votre promo vous attend sur AET Connect, l’annuaire des Anciens Enfants de Troupe : avec le code d’un collègue, ou en demandant un code. ${URL_SITE} #AETConnect`,
    },
  },
  {
    id: 'ecoles',
    titre: 'Les neuf écoles',
    conseil: 'Le visuel d’ensemble d’abord ; puis une école par semaine, le carré dans le fil et la story le même jour. Chaque école a son propre texte.',
    textes: {
      linkedin: `Neuf écoles, une seule famille.\n\nEMPT (Côte d’Ivoire), PMS (Sénégal), CME (Togo), PMK Kati (Mali), PMB (Bénin), PMK (Burkina Faso), PMN (Niger), LMJF-GMK (Bénin), PML (Gabon) : des prytanées et des écoles militaires de huit pays, une même discipline, une même entraide.\n\nLes AET de chacune de ces écoles se retrouvent sur AET Connect.\n\n👉 ${URL_SITE}\n\n${HASHTAGS}`,
      instagram: `Neuf écoles, une seule famille : des prytanées et des écoles militaires de huit pays, une même discipline, une même entraide. Les AET de chacune se retrouvent sur AET Connect. Lien dans la bio.\n.\n${HASHTAGS}`,
      whatsapp: `Neuf écoles, une seule famille 🌞 Les AET de l’EMPT, du PMS, du CME, des PMK, du PMB, du PMN, du LMJF-GMK et du PML se retrouvent sur AET Connect : ${URL_SITE}`,
      x: `Neuf écoles, une seule famille : EMPT, PMS, CME, PMK Kati, PMB, PMK, PMN, LMJF-GMK, PML. Les AET de chacune se retrouvent sur AET Connect. ${URL_SITE} #AETConnect`,
    },
  },
  {
    id: 'ambassadeur',
    titre: 'Ambassadeurs',
    textes: {
      linkedin: `Personne de votre promo n’est encore sur AET Connect ?\n\nVous pouvez ouvrir la voie : demandez l’accès, un administrateur étudie votre demande puis vous envoie votre code. Vous pouvez aussi proposer de représenter votre promo. L’ambassadeur d’une promo dispose de 15 invitations pour rassembler les autres.\n\nUne promo, un ambassadeur.\n\n👉 ${URL_SITE}\n\n${HASHTAGS}`,
      instagram: `Personne de votre promo n’est encore inscrit ? Vous pouvez ouvrir la voie et proposer de la représenter : 15 invitations pour rassembler les autres. Lien dans la bio.\n.\n${HASHTAGS}`,
      whatsapp: `Personne de ta promo sur AET Connect ? Tu peux demander l’accès et devenir l’ambassadeur de la promo (15 invitations pour rassembler les autres) : ${URL_SITE}`,
      x: `Personne de votre promo sur AET Connect ? Vous pouvez demander l’accès et proposer de la représenter : 15 invitations pour rassembler les autres. ${URL_SITE} #AETConnect`,
    },
  },
  {
    id: 'entraide',
    titre: 'Un AET dans chaque ville',
    textes: {
      linkedin: `Un AET dans chaque ville.\n\nVous arrivez à Dakar, Paris, Montréal ou Abidjan ? Sur AET Connect, vous pouvez chercher un AET par école, promo, pays ou ville : pour un conseil, une mise en relation ou un premier contact.\n\nChacun choisit ce qu’il montre : ville, téléphone, email, LinkedIn.\n\n👉 ${URL_SITE}\n\n${HASHTAGS}`,
      instagram: `Un AET dans chaque ville : sur AET Connect, vous pouvez chercher un AET par école, promo, pays ou ville. Chacun choisit ce qu’il montre. Lien dans la bio.\n.\n${HASHTAGS}`,
      whatsapp: `Un AET dans chaque ville : sur AET Connect, on peut chercher un AET par école, promo, pays ou ville. ${URL_SITE}`,
      x: `Un AET dans chaque ville : sur AET Connect, vous pouvez chercher un AET par école, promo, pays ou ville. ${URL_SITE} #AETConnect #EnfantsDeTroupe`,
    },
  },
  {
    id: 'carrousel',
    titre: 'Carrousel « Rejoindre AET Connect »',
    conseil: 'Les cinq images se publient ensemble et dans l’ordre (Instagram : plusieurs photos ; LinkedIn : plusieurs images ou document).',
    textes: {
      linkedin: `Trois façons de rejoindre AET Connect, selon votre promo :\n1. Un collègue de promotion vous a envoyé un code : il suffit de le saisir.\n2. Des collègues de votre promo sont déjà inscrits : vous pouvez demander un code.\n3. Personne de votre promo n’est encore inscrit : vous pouvez demander l’accès, et proposer de représenter votre promo.\n\n👉 ${URL_SITE}\n\n${HASHTAGS}`,
      instagram: `Trois façons de rejoindre AET Connect, selon votre promo : avec le code d’un collègue, en demandant un code, ou en demandant l’accès si personne de votre promo n’est encore inscrit. Lien dans la bio.\n.\n${HASHTAGS}`,
      whatsapp: `Rejoindre AET Connect : avec le code d’un collègue de promo, en demandant un code, ou en demandant l’accès si personne de ta promo n’est inscrit. ${URL_SITE}`,
      x: `Rejoindre AET Connect : avec le code d’un collègue, en demandant un code, ou en demandant l’accès si personne de votre promo n’est inscrit. ${URL_SITE} #AETConnect`,
    },
  },
  {
    id: 'devise',
    titre: 'Devise',
    conseil: 'Pour une date symbolique (anniversaire d’une école, journée des AET), ou en story pour relancer.',
    textes: {
      linkedin: `AET un jour, AET toujours. 🌞\n${URL_SITE}\n#AETConnect #EnfantsDeTroupe`,
      instagram: `AET un jour, AET toujours. 🌞\nLien dans la bio.\n#AETConnect #EnfantsDeTroupe`,
      whatsapp: `AET un jour, AET toujours 🌞 ${URL_SITE}`,
      x: `AET un jour, AET toujours. ${URL_SITE} #AETConnect #EnfantsDeTroupe`,
    },
  },
  {
    id: 'profils',
    titre: 'Profils et couvertures',
    conseil: 'Pour habiller une page Facebook, une page ou un profil LinkedIn, un compte X ou un groupe WhatsApp.',
  },
  { id: 'marque', titre: 'Logos', conseil: 'Sur fond transparent : le vert sur fond clair, le crème sur fond foncé.' },
]

/* ─────────── Calendrier et invitations ─────────── */

export const CALENDRIER: { semaine: number; jour: string; publication: string }[] = [
  { semaine: 1, jour: 'Lundi', publication: 'Lancement' },
  { semaine: 1, jour: 'Jeudi', publication: 'Les neuf écoles' },
  { semaine: 1, jour: 'Samedi', publication: 'Carrousel « Rejoindre AET Connect »' },
  { semaine: 2, jour: 'Mardi', publication: 'Votre promo vous attend' },
  { semaine: 2, jour: 'Vendredi', publication: 'Une première école' },
  { semaine: 3, jour: 'Mardi', publication: 'Ambassadeurs' },
  { semaine: 3, jour: 'Vendredi', publication: 'Une deuxième école' },
  { semaine: 4, jour: 'Mardi', publication: 'Un AET dans chaque ville' },
  { semaine: 4, jour: 'Vendredi', publication: 'Une troisième école' },
  { semaine: 4, jour: 'Dimanche', publication: 'Devise (story)' },
]

export const INVITATIONS: { titre: string; texte: string }[] = [
  {
    titre: 'Dans un groupe WhatsApp de promo',
    texte: `Salut la promo 👋\nAET Connect, l’annuaire des Anciens Enfants de Troupe, est en ligne. On peut y retrouver toute la promo et chercher des AET par pays ou par ville. C’est sur invitation : je peux vous envoyer un code, ou vous pouvez en demander un ici : ${URL_SITE}\nAET un jour, AET toujours.`,
  },
  {
    titre: 'Email à un responsable d’association d’anciens',
    texte: `Objet : AET Connect, l’annuaire des Anciens Enfants de Troupe\n\nBonjour [prénom],\n\nAET Connect est un annuaire en ligne réservé aux Anciens Enfants de Troupe des neuf prytanées et écoles militaires préparatoires d’Afrique de l’Ouest et centrale. Chacun y retrouve ses collègues de promotion et peut chercher un AET par école, promo, pays ou ville. L’accès se fait sur invitation, et chacun choisit ce qu’il montre de son profil.\n\nNous serions heureux que les AET de [école ou association] le découvrent. Vous pouvez relayer ce lien, et nous vous enverrons volontiers des visuels prêts à publier : ${URL_SITE}\n\nBien cordialement,\n[signature]`,
  },
]

/* ─────────── TEXTES.md ─────────── */

const citation = (t: string) =>
  t
    .split('\n')
    .map((l) => (l ? `> ${l}` : '>'))
    .join('\n')

/** Le fichier TEXTES.md du dossier à partager, tiré des mêmes textes que la page d'administration */
export function textesMarkdown(): string {
  const themes = THEMES.filter((t) => t.textes)
    .map((t, i) => {
      const blocs = RESEAUX.map((r) => `**${r.nom}**\n\n${citation(t.textes![r.id])}`).join('\n\n')
      const conseil = t.conseil ? `${t.conseil}\n\n` : ''
      const ecoles =
        t.id === 'ecoles'
          ? `\n\n### Une école par visuel\n\n${ECOLES_KIT.map((e) => `**${e.sigle}** (LinkedIn · Facebook)\n\n${citation(textesEcole(e).linkedin)}`).join('\n\n')}`
          : ''
      return `## ${i + 1}. ${t.titre}\n\n${conseil}${blocs}${ecoles}`
    })
    .join('\n\n---\n\n')
  const calendrier = `| Semaine | Jour | Publication |\n|---|---|---|\n${CALENDRIER.map((c) => `| ${c.semaine} | ${c.jour} | ${c.publication} |`).join('\n')}`
  const invitations = INVITATIONS.map((m) => `### ${m.titre}\n\n${citation(m.texte)}`).join('\n\n')
  return `# Textes à publier

Ce fichier est généré à partir des textes de la page d’administration « Kit réseaux sociaux » (frontend/lib/kit-reseaux.ts). Chaque publication associe un visuel et un texte adapté au réseau.

Hashtags de base : **${HASHTAGS}**.

---

${themes}

---

## Calendrier sur quatre semaines

Deux à trois publications par semaine, plus une story le jour de chaque publication. Ensuite, une école par semaine jusqu’aux neuf, en alternant avec les autres thèmes.

${calendrier}

---

## Messages d’invitation

${invitations}

Le message d’un membre à un collègue de promo (avec son code) est préparé par le site lui-même, page « Mes codes », avec des boutons pour le copier ou l’envoyer par WhatsApp, email ou SMS.
`
}
