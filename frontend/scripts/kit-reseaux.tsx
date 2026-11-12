// Génère le kit réseaux sociaux d'AET Connect dans communication/reseaux-sociaux/ : visuels PNG aux formats de
// chaque réseau, logos, et une page d'aperçu. Les visuels reprennent le système « Esprit de corps » du site :
// couleurs, polices (Unbounded, Figtree), trame topographique, soleil aux neuf pétales, drapeaux, photos en noir et blanc.
//
//   cd frontend && npx tsx scripts/kit-reseaux.tsx
//
// Seules des photos du domaine public et des images générées pour AET Connect sont utilisées (aucune attribution
// obligatoire) ; ce sont des illustrations, jamais présentées comme des membres.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { chromium } from '@playwright/test'
import { Drapeau } from '../components/landing/drapeau'
import { SOLEIL_COEUR, SOLEIL_PETALES } from '../lib/soleil'

const RACINE = join(__dirname, '..', '..', 'communication', 'reseaux-sociaux')
const PUBLIC = join(__dirname, '..', 'public')
const SITE = 'aet-connect.vercel.app'

const C = {
  vert: '#1D3B2A',
  vertNuit: '#12261B',
  or: '#FFC000',
  terre: '#8B4A1E',
  creme: '#F4EEE2',
  sable: '#DDD2BB',
  encre: '#14211A',
  olive: '#4D5E52',
  brume: '#C3D1C6',
}

/* ─────────── Ressources ─────────── */

const dataUri = (chemin: string, type: string) => `data:${type};base64,${readFileSync(join(PUBLIC, chemin)).toString('base64')}`
const PHOTO = {
  ceremonie: dataUri('images/accueil/ceremonie.jpg', 'image/jpeg'),
  promo: dataUri('images/accueil/promo-grand.jpg', 'image/jpeg'),
  garde: dataUri('images/accueil/garde-honneur.jpg', 'image/jpeg'),
  officier: dataUri('images/accueil/officier.jpg', 'image/jpeg'),
  portage: dataUri('images/accueil/portage.jpg', 'image/jpeg'),
  secours: dataUri('images/accueil/secours.jpg', 'image/jpeg'),
  accueil: dataUri('images/accueil/parcours-accueil.jpg', 'image/jpeg'),
  salle: dataUri('images/accueil/parcours-salle.jpg', 'image/jpeg'),
}
const TOPO_CREME = dataUri('motifs/topo-creme.svg', 'image/svg+xml')
const TOPO_VERT = dataUri('motifs/topo-vert.svg', 'image/svg+xml')

const soleil = (taille: number, petales = C.vert, coeur = C.terre) =>
  `<svg viewBox="0 0 200 200" width="${taille}" height="${taille}" aria-hidden="true"><path d="${SOLEIL_PETALES}" fill="${petales}"/><path d="${SOLEIL_COEUR}" fill="${coeur}"/></svg>`
const drapeau = (pays: string, hauteur: number) =>
  renderToStaticMarkup(<Drapeau pays={pays} className="drapeau" />).replace('<svg ', `<svg style="height:${hauteur}px;width:auto;align-self:flex-start;border-radius:${Math.max(2, hauteur / 10)}px" `)

/** La signature : le soleil et « AET Connect », comme dans l'en-tête du site */
const marque = (taille: number, ton: 'vert' | 'creme') =>
  `<div class="marque" style="gap:${taille * 0.32}px">${soleil(taille, ton === 'vert' ? C.creme : C.vert)}<span class="titre" style="font-size:${taille * 0.62}px;font-weight:500;letter-spacing:-0.02em">AET Connect</span></div>`

/* ─────────── Les écoles (celles du site, avec leur sigle) ─────────── */

const ECOLES = [
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
const fichierEcole = (sigle: string) =>
  sigle
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/* ─────────── La page ─────────── */

function page(l: number, h: number, corps: string, fond: 'vert' | 'creme' | 'transparent' = 'vert') {
  const fonds = {
    vert: `background:${C.vert};color:${C.creme}`,
    creme: `background:${C.creme};color:${C.encre}`,
    transparent: 'background:transparent',
  }
  const trame = fond === 'transparent' ? '' : `body::before{content:'';position:absolute;inset:0;z-index:-1;background:url("${fond === 'vert' ? TOPO_CREME : TOPO_VERT}") 0 0/${Math.round(l * 1.2)}px repeat;opacity:${fond === 'vert' ? 0.05 : 0.04}}`
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Unbounded:wght@500;600;700&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${l}px;height:${h}px;overflow:hidden}
body{position:relative;isolation:isolate;${fonds[fond]};font-family:Figtree,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
${trame}
.titre{font-family:Unbounded,sans-serif;font-weight:700;letter-spacing:-0.03em;line-height:1.06;text-wrap:balance}
.marque{display:flex;align-items:center;white-space:nowrap}
.photo{display:block;width:100%;height:100%;object-fit:cover;filter:grayscale(1) contrast(1.06)}
.cadre{overflow:hidden;background:${C.vertNuit}}
.or{color:${C.or}}.brume{color:${C.brume}}.olive{color:${C.olive}}.terre{color:${C.terre}}.vert{color:${C.vert}}.creme{color:${C.creme}}
</style></head><body>${corps}</body></html>`
}

type Format = { nom: string; l: number; h: number }
const CARRE: Format = { nom: 'carre', l: 1080, h: 1080 }
const PORTRAIT: Format = { nom: 'portrait', l: 1080, h: 1350 }
const STORY: Format = { nom: 'story', l: 1080, h: 1920 }
const PAYSAGE: Format = { nom: 'paysage', l: 1200, h: 627 }

/* ─────────── Compositions ─────────── */

/** Bandeau vert, titre, phrase, photo aux coins exagérés et l'adresse du site en or */
function affiche(f: Format, o: { titre: string; texte: string; photo: string; position?: string; adresse?: string }) {
  const adresse = o.adresse ?? SITE
  if (f.nom === 'paysage') {
    return page(
      f.l,
      f.h,
      `<div style="display:grid;grid-template-columns:1.05fr 1fr;height:100%">
        <div style="display:flex;flex-direction:column;justify-content:space-between;padding:56px 48px 52px 64px">
          ${marque(46, 'vert')}
          <div>
            <h1 class="titre" style="font-size:54px">${o.titre}</h1>
            <p class="brume" style="margin-top:22px;font-size:25px;line-height:1.45">${o.texte}</p>
          </div>
          <p class="or" style="font-size:24px;font-weight:600">${adresse}</p>
        </div>
        <div style="padding:20px 20px 20px 0"><div class="cadre" style="height:100%;border-radius:28px 96px 28px 28px">
          <img class="photo" src="${o.photo}" style="object-position:${o.position ?? 'center'}"></div></div>
      </div>`,
    )
  }
  const story = f.nom === 'story'
  const pad = 72
  const haut = story ? 230 : pad // zones sûres des stories : l'interface couvre le haut et le bas
  const bas = story ? 250 : pad
  const tailleTitre = f.nom === 'carre' ? 74 : story ? 92 : 84
  return page(
    f.l,
    f.h,
    `<div style="display:flex;flex-direction:column;height:100%;padding:${haut}px ${pad}px ${bas}px">
      ${marque(story ? 64 : 54, 'vert')}
      <h1 class="titre" style="margin-top:${story ? 90 : 52}px;font-size:${tailleTitre}px">${o.titre}</h1>
      <p class="brume" style="margin-top:${story ? 34 : 26}px;font-size:${story ? 38 : 32}px;line-height:1.45;max-width:34ch">${o.texte}</p>
      <div class="cadre" style="flex:1;min-height:0;margin-top:${story ? 64 : 44}px;border-radius:36px 120px 36px 36px">
        <img class="photo" src="${o.photo}" style="object-position:${o.position ?? 'center'}">
      </div>
      <p class="or" style="margin-top:${story ? 44 : 32}px;font-size:${story ? 38 : 30}px;font-weight:600">${adresse}</p>
    </div>`,
  )
}

/** Les neuf écoles : sigle, drapeau et pays, en grille */
function neufEcoles(f: Format) {
  const paysage = f.nom === 'paysage'
  const story = f.nom === 'story'
  const cols = paysage ? 5 : 3
  const sigle = paysage ? 30 : story ? 50 : 44
  const cellules = ECOLES.map(
    (e) => `<div style="display:flex;flex-direction:column;gap:${paysage ? 6 : 10}px">
      ${drapeau(e.pays, paysage ? 22 : story ? 40 : 34)}
      <span class="titre" style="font-size:${e.sigle.length > 6 ? sigle * 0.78 : sigle}px;margin-top:${paysage ? 4 : 6}px;white-space:nowrap">${e.sigle}</span>
      <span class="brume" style="font-size:${paysage ? 18 : story ? 30 : 26}px">${e.pays}</span>
    </div>`,
  ).join('')
  const grille = `<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:${paysage ? '26px 30px' : story ? '70px 36px' : f.nom === 'carre' ? '34px 36px' : '52px 36px'}">${cellules}</div>`
  if (paysage) {
    return page(
      f.l,
      f.h,
      `<div style="display:flex;flex-direction:column;justify-content:space-between;height:100%;padding:52px 64px">
        <div style="display:flex;justify-content:space-between;align-items:center">${marque(42, 'vert')}<span class="or" style="font-size:22px;font-weight:600">${SITE}</span></div>
        <h1 class="titre" style="font-size:52px">Neuf écoles, une seule famille</h1>
        ${grille}
      </div>`,
    )
  }
  const pad = 72
  return page(
    f.l,
    f.h,
    `<div style="display:flex;flex-direction:column;height:100%;padding:${story ? 230 : pad}px ${pad}px ${story ? 250 : pad}px">
      ${marque(story ? 64 : 54, 'vert')}
      <h1 class="titre" style="margin-top:${story ? 90 : f.nom === 'carre' ? 40 : 50}px;font-size:${story ? 92 : f.nom === 'carre' ? 64 : 82}px">Neuf écoles, une seule famille</h1>
      <p class="brume" style="margin-top:${f.nom === 'carre' ? 18 : 24}px;font-size:${story ? 36 : f.nom === 'carre' ? 28 : 30}px;line-height:1.45">Des prytanées et des écoles militaires de huit pays, une même discipline, une même entraide.</p>
      <div style="flex:1;display:flex;align-items:center;padding:${f.nom === 'carre' ? '28px 0' : '40px 0'}">${grille}</div>
      <p class="or" style="font-size:${story ? 38 : 30}px;font-weight:600">${SITE}</p>
    </div>`,
  )
}

/** Une école : le sigle en grand, sur crème ; le bandeau vert dit où retrouver sa promo */
function ecole(f: Format, e: (typeof ECOLES)[number]) {
  const story = f.nom === 'story'
  const pad = 72
  const tailleSigle = e.sigle.length > 6 ? (story ? 130 : 112) : story ? 190 : 160
  return page(
    f.l,
    f.h,
    `<div style="display:flex;flex-direction:column;height:100%;padding:${story ? 230 : pad}px ${pad}px ${story ? 250 : pad}px">
      ${marque(story ? 64 : 54, 'creme')}
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
        ${drapeau(e.pays, story ? 80 : 64)}
        <h1 class="titre vert" style="margin-top:${story ? 44 : 34}px;font-size:${tailleSigle}px;letter-spacing:-0.04em;line-height:1">${e.sigle}</h1>
        <p style="margin-top:${story ? 30 : 22}px;font-size:${story ? 42 : 36}px;line-height:1.3;max-width:24ch">${e.nom}</p>
        <p class="olive" style="margin-top:14px;font-size:${story ? 34 : 28}px">${e.ville} · ${e.pays} · depuis ${e.annee}</p>
      </div>
      <div style="position:relative;isolation:isolate;overflow:hidden;background:${C.vert};color:${C.creme};border-radius:32px 100px 32px 32px;padding:${story ? '52px 56px' : '40px 48px'}">
        <div style="position:absolute;inset:0;z-index:-1;background:url('${TOPO_CREME}') 0 0/900px repeat;opacity:.06"></div>
        <p class="titre" style="font-size:${story ? 46 : 38}px;line-height:1.2">Vos collègues de promotion vous attendent sur AET Connect</p>
        <p class="or" style="margin-top:${story ? 24 : 18}px;font-size:${story ? 36 : 30}px;font-weight:600">${SITE}</p>
      </div>
    </div>`,
    'creme',
  )
}

/** La devise, en typographie seule sur crème */
function devise(f: Format) {
  const story = f.nom === 'story'
  return page(
    f.l,
    f.h,
    `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;height:100%;padding:${story ? '230px 80px 250px' : '80px'}">
      ${soleil(story ? 260 : 210)}
      <h1 class="titre vert" style="margin-top:${story ? 80 : 60}px;font-size:${story ? 112 : 96}px;line-height:1.05">AET un jour,<br>AET toujours</h1>
      <p class="olive" style="margin-top:${story ? 50 : 40}px;font-size:${story ? 38 : 32}px;line-height:1.45;max-width:26ch">L’annuaire des Anciens Enfants de Troupe, sur invitation.</p>
      <p class="terre" style="margin-top:${story ? 70 : 52}px;font-size:${story ? 38 : 30}px;font-weight:600">${SITE}</p>
    </div>`,
    'creme',
  )
}

/* ─────────── Le carrousel « Rejoindre AET Connect » (1080 × 1350) ─────────── */

const CAS = [
  {
    titre: 'Un collègue de promotion vous a envoyé un code',
    texte: 'Il suffit de le saisir : il vous rattache directement à votre promotion.',
    action: 'Entrer mon code',
  },
  {
    titre: 'Des collègues de votre promo sont déjà inscrits',
    texte: 'Votre demande arrive à l’équipe AET Connect, qui vous transmet un code pour rejoindre votre promo.',
    action: 'Demander un code',
  },
  {
    titre: 'Personne de votre promo n’est encore inscrit',
    texte: 'Vous ouvrez la voie pour votre promo : un administrateur étudie votre demande, puis vous envoie votre code d’invitation. Vous pouvez aussi proposer de représenter votre promo.',
    action: 'Demander l’accès',
  },
]

function carrousel(): { nom: string; html: string }[] {
  const f = PORTRAIT
  const couverture = page(
    f.l,
    f.h,
    `<div style="display:flex;flex-direction:column;height:100%;padding:72px">
      ${marque(54, 'vert')}
      <h1 class="titre" style="margin-top:56px;font-size:88px">Rejoindre AET Connect</h1>
      <p class="brume" style="margin-top:28px;font-size:34px;line-height:1.45;max-width:26ch">Trois façons d’entrer dans l’annuaire, selon votre promo.</p>
      <div class="cadre" style="flex:1;margin-top:52px;border-radius:36px 120px 36px 36px"><img class="photo" src="${PHOTO.accueil}" style="object-position:center 40%"></div>
      <p class="brume" style="margin-top:30px;font-size:28px">Faites glisser →</p>
    </div>`,
  )
  const cas = CAS.map((c, i) =>
    page(
      f.l,
      f.h,
      `<div style="display:flex;flex-direction:column;height:100%;padding:72px">
        ${marque(54, 'creme')}
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
          <p class="terre" style="font-size:34px;font-weight:600">Cas ${i + 1}/3</p>
          <h1 class="titre vert" style="margin-top:24px;font-size:76px">${c.titre}</h1>
          <p style="margin-top:36px;font-size:38px;line-height:1.5;max-width:28ch">${c.texte}</p>
          <p style="margin-top:56px"><span style="display:inline-flex;align-items:center;gap:16px;background:${C.vert};color:${C.creme};border-radius:999px;padding:24px 44px;font-size:32px;font-weight:600">${c.action} →</span></p>
        </div>
        <p class="olive" style="font-size:28px">Sur ${SITE}</p>
      </div>`,
      'creme',
    ),
  )
  const fin = page(
    f.l,
    f.h,
    `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;height:100%;padding:80px">
      ${soleil(220, C.creme)}
      <h1 class="titre" style="margin-top:64px;font-size:86px">Votre promo vous attend</h1>
      <p class="brume" style="margin-top:32px;font-size:36px;line-height:1.45;max-width:24ch">L’annuaire des Anciens Enfants de Troupe, sur invitation.</p>
      <p class="or" style="margin-top:56px;font-size:44px;font-weight:600">${SITE}</p>
    </div>`,
  )
  return [couverture, ...cas, fin].map((html, i) => ({ nom: `rejoindre-${i + 1}`, html }))
}

/* ─────────── Profil et couvertures ─────────── */

function avatar(ton: 'vert' | 'creme') {
  return page(
    1080,
    1080,
    `<div style="display:grid;place-items:center;height:100%">${soleil(620, ton === 'vert' ? C.creme : C.vert)}</div>`,
    ton,
  )
}

/** Couverture : la signature et la phrase à gauche (ou au centre), une bande de photos à droite */
function couverture(l: number, h: number, o: { marge: string; photos: 0 | 1 | 2; centrer?: boolean }) {
  const grand = Math.min(h * 0.17, 92)
  const titre = Math.min(h * 0.11, 64)
  const bande =
    o.photos === 2
      ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;height:100%;padding:24px 24px 24px 0">
        <div class="cadre" style="border-radius:24px"><img class="photo" src="${PHOTO.ceremonie}"></div>
        <div class="cadre" style="border-radius:24px 80px 24px 24px"><img class="photo" src="${PHOTO.promo}" style="object-position:30% center"></div>
      </div>`
      : o.photos === 1
        ? `<div style="height:100%;padding:20px 20px 20px 0"><div class="cadre" style="height:100%;border-radius:24px 72px 24px 24px"><img class="photo" src="${PHOTO.ceremonie}" style="object-position:center 40%"></div></div>`
        : ''
  return page(
    l,
    h,
    `<div style="display:grid;grid-template-columns:${o.photos === 2 ? '1.15fr 1fr' : o.photos === 1 ? '1.7fr 1fr' : '1fr'};height:100%">
      <div style="display:flex;flex-direction:column;justify-content:center;gap:${h * 0.07}px;padding:${o.marge};${o.centrer ? 'align-items:center;text-align:center' : ''}">
        ${marque(grand, 'vert')}
        <p class="titre" style="font-size:${titre}px;font-weight:600;line-height:1.15">Enfants de Troupe, une seule famille</p>
        <p class="or" style="font-size:${titre * 0.5}px;font-weight:600">${SITE}</p>
      </div>
      ${bande}
    </div>`,
  )
}

/** Le logo seul, sur fond transparent */
function logo(ton: 'vert' | 'creme') {
  return page(
    1600,
    400,
    `<div style="display:grid;place-items:center;height:100%;color:${ton === 'vert' ? C.vert : C.creme}">
      <div class="marque" style="gap:44px">${soleil(250, ton === 'vert' ? C.vert : C.creme)}<span class="titre" style="font-size:150px;font-weight:500;letter-spacing:-0.02em">AET Connect</span></div>
    </div>`,
    'transparent',
  )
}

/* ─────────── Rendu ─────────── */

type Visuel = { chemin: string; html: string; l: number; h: number; transparent?: boolean; groupe: string; usage: string }

function visuels(): Visuel[] {
  const v: Visuel[] = []
  const ajouter = (groupe: string, usage: string, chemin: string, html: string, l: number, h: number, transparent = false) =>
    v.push({ groupe, usage, chemin, html, l, h, transparent })
  const formats = [CARRE, PORTRAIT, STORY, PAYSAGE]
  const USAGE: Record<string, string> = {
    carre: 'Publication Facebook, Instagram, LinkedIn (1080 × 1080)',
    portrait: 'Publication Instagram, Facebook (1080 × 1350)',
    story: 'Story Instagram, Facebook, statut WhatsApp (1080 × 1920)',
    paysage: 'Lien LinkedIn, Facebook, X (1200 × 627)',
  }

  const affiches = [
    {
      dossier: '01-lancement',
      groupe: '1. Lancement',
      titre: 'AET un jour, AET toujours',
      texte: 'AET Connect, l’annuaire des Anciens Enfants de Troupe, est en ligne. Sur invitation.',
      photo: PHOTO.ceremonie,
      position: 'center 35%',
    },
    {
      dossier: '02-votre-promo',
      groupe: '2. Retrouver sa promo',
      titre: 'Votre promo vous attend',
      texte: 'Retrouvez vos collègues de promotion, entrés dans la même école la même année que vous.',
      photo: PHOTO.promo,
      position: '35% center',
    },
    {
      dossier: '04-ambassadeur',
      groupe: '4. Ambassadeurs',
      titre: 'Ouvrir la voie pour sa promo',
      texte: 'Personne de votre promo n’est inscrit ? Vous pouvez demander l’accès et proposer de la représenter : 15 invitations pour rassembler les autres.',
      photo: PHOTO.accueil,
      position: 'center 40%',
    },
    {
      dossier: '05-entraide',
      groupe: '5. Entraide',
      titre: 'Un AET dans chaque ville',
      texte: 'Pour un conseil, une mise en relation ou un premier contact en arrivant : cherchez un AET par école, promo, pays ou ville.',
      photo: PHOTO.secours,
      position: 'center 40%',
    },
  ]
  for (const a of affiches) {
    for (const f of formats) ajouter(a.groupe, USAGE[f.nom], `visuels/${a.dossier}/${a.dossier.slice(3)}-${f.nom}.png`, affiche(f, a), f.l, f.h)
  }
  for (const f of formats) ajouter('3. Les neuf écoles', USAGE[f.nom], `visuels/03-ecoles/neuf-ecoles-${f.nom}.png`, neufEcoles(f), f.l, f.h)
  for (const e of ECOLES) {
    for (const f of [CARRE, STORY]) {
      ajouter('3. Les neuf écoles', `${e.sigle} · ${USAGE[f.nom]}`, `visuels/03-ecoles/${fichierEcole(e.sigle)}-${f.nom}.png`, ecole(f, e), f.l, f.h)
    }
  }
  for (const s of carrousel()) ajouter('6. Carrousel « Rejoindre »', 'Carrousel Instagram, LinkedIn (1080 × 1350), dans l’ordre', `visuels/06-carrousel-rejoindre/${s.nom}.png`, s.html, 1080, 1350)
  for (const f of [CARRE, STORY]) ajouter('7. Devise', USAGE[f.nom], `visuels/07-devise/devise-${f.nom}.png`, devise(f), f.l, f.h)

  ajouter('Profils et couvertures', 'Photo de profil, fond vert (1080 × 1080, se recadre en rond)', 'profils-et-couvertures/photo-de-profil-vert.png', avatar('vert'), 1080, 1080)
  ajouter('Profils et couvertures', 'Photo de profil, fond crème (1080 × 1080)', 'profils-et-couvertures/photo-de-profil-creme.png', avatar('creme'), 1080, 1080)
  // Les photos de profil recouvrent le bas à gauche des couvertures LinkedIn et X : le texte est décalé à droite
  ajouter('Profils et couvertures', 'Couverture de page Facebook (1640 × 624)', 'profils-et-couvertures/couverture-facebook.png', couverture(1640, 624, { marge: '0 40px 0 110px', photos: 2 }), 1640, 624)
  ajouter('Profils et couvertures', 'Bannière de profil LinkedIn (1584 × 396)', 'profils-et-couvertures/banniere-linkedin-profil.png', couverture(1584, 396, { marge: '0 40px 0 470px', photos: 1 }), 1584, 396)
  ajouter('Profils et couvertures', 'Couverture de page LinkedIn (1128 × 191)', 'profils-et-couvertures/couverture-linkedin-page.png', couverture(1128, 191, { marge: '0 40px', photos: 0, centrer: true }), 1128, 191)
  ajouter('Profils et couvertures', 'Bannière X (1500 × 500)', 'profils-et-couvertures/banniere-x.png', couverture(1500, 500, { marge: '0 40px 0 320px', photos: 1 }), 1500, 500)
  ajouter('Profils et couvertures', 'Couverture de groupe WhatsApp ou Facebook (1640 × 856)', 'profils-et-couvertures/couverture-groupe.png', couverture(1640, 856, { marge: '0 40px 0 110px', photos: 2 }), 1640, 856)

  ajouter('Marque', 'Logo vert, fond transparent', 'marque/logo-vert.png', logo('vert'), 1600, 400, true)
  ajouter('Marque', 'Logo crème, fond transparent (sur fond foncé)', 'marque/logo-creme.png', logo('creme'), 1600, 400, true)
  ajouter('Marque', 'Soleil seul, fond transparent', 'marque/soleil.png', page(1024, 1024, `<div style="display:grid;place-items:center;height:100%">${soleil(960)}</div>`, 'transparent'), 1024, 1024, true)
  return v
}

/** Une page qui montre tous les visuels, à ouvrir dans un navigateur */
function apercu(v: Visuel[]) {
  // Les thèmes numérotés d'abord, dans l'ordre ; puis profils, couvertures et marque
  const groupes = [...new Set(v.map((x) => x.groupe))].sort((a, b) => a.localeCompare(b, 'fr', { numeric: true }))
  const sections = groupes
    .map((g) => {
      const items = v
        .filter((x) => x.groupe === g)
        .map(
          (x) => `<figure><a href="${x.chemin}"><img src="${x.chemin}" loading="lazy" style="aspect-ratio:${x.l}/${x.h}"></a>
            <figcaption><strong>${x.chemin.split('/').pop()}</strong><br>${x.usage}</figcaption></figure>`,
        )
        .join('')
      return `<section><h2>${g}</h2><div class="grille">${items}</div></section>`
    })
    .join('')
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kit réseaux sociaux · AET Connect</title>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;600&family=Unbounded:wght@600;700&display=swap" rel="stylesheet">
<style>
body{margin:0;background:${C.creme};color:${C.encre};font-family:Figtree,sans-serif}
header{background:${C.vert};color:${C.creme};padding:48px 24px}
header div,main{max-width:1200px;margin:0 auto}
h1,h2{font-family:Unbounded,sans-serif;letter-spacing:-0.02em}
h1{font-size:clamp(1.8rem,4vw,2.6rem);margin:0}
header p{color:${C.brume};max-width:60ch;line-height:1.5}
main{padding:24px}
h2{color:${C.vert};font-size:1.3rem;margin:48px 0 16px}
.grille{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px;align-items:start}
figure{margin:0;background:#fff;border-radius:18px;padding:10px}
figure img{display:block;width:100%;height:auto;border-radius:10px;background:${C.sable}}
figcaption{font-size:.85rem;color:${C.olive};padding:10px 4px 4px;line-height:1.4}
figcaption strong{color:${C.encre}}
</style></head><body>
<header><div><h1>Kit réseaux sociaux · AET Connect</h1><p>Tous les visuels prêts à publier, rangés par thème. Cliquez sur une image pour l’ouvrir en grand. Les textes à publier avec chaque visuel sont dans TEXTES.md.</p></div></header>
<main>${sections}</main></body></html>`
}

async function main() {
  const v = visuels()
  for (const d of ['visuels', 'profils-et-couvertures', 'marque']) rmSync(join(RACINE, d), { recursive: true, force: true })
  const navigateur = await chromium.launch({ channel: 'chrome' })
  const contexte = await navigateur.newContext({ deviceScaleFactor: 1 })
  const p = await contexte.newPage()
  for (const x of v) {
    await p.setViewportSize({ width: x.l, height: x.h })
    await p.setContent(x.html, { waitUntil: 'networkidle' })
    await p.evaluate(() => document.fonts.ready)
    const sortie = join(RACINE, x.chemin)
    mkdirSync(dirname(sortie), { recursive: true })
    await p.screenshot({ path: sortie, omitBackground: x.transparent ?? false })
    console.log(relative(RACINE, sortie))
  }
  await navigateur.close()
  writeFileSync(join(RACINE, 'apercu.html'), apercu(v))
  console.log(`${v.length} visuels générés dans ${relative(process.cwd(), RACINE)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
