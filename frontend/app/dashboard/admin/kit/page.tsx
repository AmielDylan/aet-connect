'use client'

// Administration · kit réseaux sociaux : les visuels prêts à publier (générés par scripts/kit-reseaux.tsx dans
// public/kit/), rangés par thème, avec le texte de chaque réseau. Chaque visuel se télécharge ou se partage
// directement : sur téléphone, « Partager » envoie l'image et le texte dans WhatsApp, Instagram ou LinkedIn ;
// ailleurs, l'image est téléchargée et le texte copié. « Tout télécharger » prépare un zip dans le navigateur.
import { useState } from 'react'
import Image from 'next/image'
import { Check, Copy, Download, Share2 } from 'lucide-react'
import { useAdminCheck } from '@/hooks/use-admin-check'
import { Filtres, boutonVert, lienSimple } from '@/components/espace/administration'
import { CALENDRIER, ECOLES_KIT, INVITATIONS, RESEAUX, THEMES, URL_SITE, textesEcole, textesMarkdown, type Reseau, type Theme } from '@/lib/kit-reseaux'
import VISUELS from '@/lib/kit-visuels.json'

type Visuel = { fichier: string; l: number; h: number; groupe: string; usage: string; format: string; ecole?: string }
const visuels = VISUELS as Visuel[]

const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'
const FORMATS: Record<string, string> = { carre: 'Carré', portrait: 'Portrait', story: 'Story', paysage: 'Paysage' }
const nomFichier = (v: Visuel) => `aet-connect-${v.fichier.split('/').pop()}`
const numero = (t: Theme) => THEMES.filter((x) => x.textes).indexOf(t) + 1

/** Le texte qui accompagne un visuel : celui de son école s'il en a une, sinon celui du thème */
function texteDe(v: Visuel, theme: Theme, reseau: Reseau) {
  const ecole = v.ecole ? ECOLES_KIT.find((e) => e.sigle === v.ecole) : undefined
  if (ecole) return textesEcole(ecole)[reseau]
  return theme.textes?.[reseau] ?? URL_SITE
}

function telecharger(url: string, nom: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = nom
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/* ─────────── Copier ─────────── */

function BoutonCopier({ texte, libelle = 'Copier le texte', className = boutonVert }: { texte: string; libelle?: string; className?: string }) {
  const [etat, setEtat] = useState<'repos' | 'copie' | 'echec'>('repos')
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        navigator.clipboard
          .writeText(texte)
          .then(() => setEtat('copie'))
          .catch(() => setEtat('echec'))
          .finally(() => setTimeout(() => setEtat('repos'), 2500))
      }
    >
      {etat === 'copie' ? <Check className="size-[18px]" aria-hidden="true" /> : <Copy className="size-[18px]" aria-hidden="true" />}
      <span aria-live="polite">{etat === 'copie' ? 'Copié' : etat === 'echec' ? 'Copie impossible' : libelle}</span>
    </button>
  )
}

/* ─────────── Un visuel ─────────── */

function CarteVisuel({ v, texte }: { v: Visuel; texte: string }) {
  const [message, setMessage] = useState<string | null>(null)
  const fond = v.groupe === 'marque' ? (v.fichier.includes('creme') ? 'bg-vert' : 'bg-sable/60') : 'bg-sable/50'

  const partager = async () => {
    setMessage(null)
    try {
      const blob = await (await fetch(v.fichier)).blob()
      const fichier = new File([blob], nomFichier(v), { type: 'image/png' })
      if (navigator.canShare?.({ files: [fichier] })) {
        await navigator.share({ files: [fichier], text: texte })
        return
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return
    }
    // Pas de partage de fichiers ici (ordinateur) : l'image est téléchargée et le texte copié
    telecharger(v.fichier, nomFichier(v))
    const copie = await navigator.clipboard.writeText(texte).then(
      () => true,
      () => false,
    )
    setMessage(copie ? 'Image téléchargée, texte copié : il reste à les coller dans votre publication.' : 'Image téléchargée.')
  }

  return (
    <li className="flex flex-col rounded-2xl bg-white p-2">
      <a href={v.fichier} target="_blank" rel="noreferrer" className={`block overflow-hidden rounded-xl ${fond}`}>
        <Image
          src={v.fichier}
          alt={`${v.ecole ? `${v.ecole}, ` : ''}${v.usage}`}
          width={v.l}
          height={v.h}
          sizes="(min-width: 1024px) 220px, 45vw"
          className="h-auto w-full"
        />
      </a>
      <p className="px-2 pt-3 text-sm text-olive">
        {v.ecole && <span className="font-semibold text-vert">{v.ecole} · </span>}
        {FORMATS[v.format] ? `${FORMATS[v.format]} · ${v.l} × ${v.h}` : v.usage}
      </p>
      {FORMATS[v.format] && <p className="px-2 text-xs text-olive">{v.usage.replace(/ \(\d+ × \d+\)$/, '').replace(/^.* · /, '')}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-x-3 px-2 pt-2">
        <a href={v.fichier} download={nomFichier(v)} className={`${lienSimple} gap-1.5 text-sm`}>
          <Download className="size-4" aria-hidden="true" />
          Télécharger
        </a>
        <button type="button" onClick={partager} className={`${lienSimple} gap-1.5 text-sm`}>
          <Share2 className="size-4" aria-hidden="true" />
          Partager
        </button>
      </div>
      {message && (
        <p role="status" className="px-2 pb-1 pt-1 text-xs text-vert">
          {message}
        </p>
      )}
    </li>
  )
}

/* ─────────── Un thème ─────────── */

function Section({ theme }: { theme: Theme }) {
  const [reseau, setReseau] = useState<Reseau>('linkedin')
  const [ecole, setEcole] = useState('')
  const liste = visuels.filter((v) => v.groupe === theme.id)
  const choisie = ECOLES_KIT.find((e) => e.sigle === ecole)
  const texte = choisie ? textesEcole(choisie)[reseau] : theme.textes?.[reseau]
  const n = numero(theme)

  return (
    <section id={theme.id} aria-labelledby={`titre-${theme.id}`} className="scroll-mt-24">
      <h2 id={`titre-${theme.id}`} className={titre2}>
        {theme.textes ? `${n}. ` : ''}
        {theme.titre}
      </h2>
      {theme.conseil && <p className="mt-2 max-w-[70ch] text-base text-olive">{theme.conseil}</p>}

      {theme.textes && texte && (
        <div className="mt-5 grid gap-4 rounded-3xl bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full sm:w-auto">
              <Filtres surBlanc libelle="Réseau" valeur={reseau} onChange={setReseau} options={RESEAUX.map((r) => ({ valeur: r.id, texte: r.nom }))} />
            </div>
            {theme.id === 'ecoles' && (
              <label className="w-full sm:w-auto">
                <span className="sr-only">École</span>
                <select
                  value={ecole}
                  onChange={(e) => setEcole(e.target.value)}
                  className="h-14 w-full rounded-full bg-sable/60 px-5 text-base text-encre outline-none focus-visible:ring-2 focus-visible:ring-vert"
                >
                  <option value="">Les neuf écoles</option>
                  {ECOLES_KIT.map((e) => (
                    <option key={e.sigle} value={e.sigle}>
                      {e.sigle}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          <p className="whitespace-pre-line rounded-2xl bg-creme p-4 text-base leading-relaxed text-encre">{texte}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <BoutonCopier texte={texte} />
            <a href={`https://wa.me/?text=${encodeURIComponent(texte)}`} target="_blank" rel="noreferrer" className={lienSimple}>
              Envoyer sur WhatsApp
            </a>
            <a href={`https://x.com/intent/post?text=${encodeURIComponent(texte)}`} target="_blank" rel="noreferrer" className={lienSimple}>
              Publier sur X
            </a>
          </div>
        </div>
      )}

      <ul className="mt-5 grid grid-cols-2 items-start gap-3 sm:grid-cols-[repeat(auto-fill,minmax(230px,1fr))] sm:gap-4">
        {liste.map((v) => (
          <CarteVisuel key={v.fichier} v={v} texte={texteDe(v, theme, reseau)} />
        ))}
      </ul>
    </section>
  )
}

/* ─────────── Tout télécharger ─────────── */

function ToutTelecharger() {
  const [etat, setEtat] = useState<{ fait: number; total: number } | null>(null)
  const [erreur, setErreur] = useState(false)

  const lancer = async () => {
    setErreur(false)
    setEtat({ fait: 0, total: visuels.length })
    try {
      const { zipSync, strToU8 } = await import('fflate')
      const fichiers: Record<string, Uint8Array> = {}
      let fait = 0
      // Par lots de six : assez vite, sans saturer la connexion
      for (let i = 0; i < visuels.length; i += 6) {
        await Promise.all(
          visuels.slice(i, i + 6).map(async (v) => {
            const octets = new Uint8Array(await (await fetch(v.fichier)).arrayBuffer())
            fichiers[`aet-connect-kit/${v.fichier.replace(/^\/kit\//, '')}`] = octets
            fait++
            setEtat({ fait, total: visuels.length })
          }),
        )
      }
      fichiers['aet-connect-kit/TEXTES.md'] = strToU8(textesMarkdown())
      // Les PNG sont déjà compressés : on les range sans les recompresser
      const zip = zipSync(fichiers, { level: 0 })
      const url = URL.createObjectURL(new Blob([zip.slice().buffer], { type: 'application/zip' }))
      telecharger(url, 'aet-connect-kit-reseaux.zip')
      setTimeout(() => URL.revokeObjectURL(url), 10_000)
    } catch {
      setErreur(true)
    } finally {
      setEtat(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      <button type="button" className={boutonVert} disabled={!!etat} onClick={lancer}>
        <Download className="size-5" aria-hidden="true" />
        {etat ? `Préparation… ${etat.fait}/${etat.total}` : 'Tout télécharger (zip)'}
      </button>
      <span className="text-sm text-olive">
        {visuels.length} visuels et les textes, environ 17{' '}Mo
      </span>
      {erreur && (
        <p role="alert" className="w-full text-base font-semibold text-alerte">
          Le zip n’a pas pu être préparé. Vous pouvez réessayer, ou télécharger les visuels un par un.
        </p>
      )}
    </div>
  )
}

/* ─────────── La page ─────────── */

export default function KitReseaux() {
  const { isAdmin } = useAdminCheck()
  if (!isAdmin) return null

  return (
    <div>
      <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em] text-vert">Kit réseaux sociaux</h1>
      <p className="mt-3 max-w-[64ch] text-lg leading-relaxed text-olive">
        Les visuels et les textes pour parler d’AET Connect et inviter d’autres AET. Sur téléphone, « Partager » envoie l’image et son texte directement dans
        WhatsApp, Instagram ou LinkedIn.
      </p>
      <div className="mt-6">
        <ToutTelecharger />
      </div>

      <nav aria-label="Thèmes du kit" className="mt-8 flex flex-wrap gap-2">
        {THEMES.map((t) => (
          <a
            key={t.id}
            href={`#${t.id}`}
            className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm text-encre transition-colors hover:text-terre"
          >
            {t.titre}
          </a>
        ))}
        <a href="#calendrier" className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm text-encre transition-colors hover:text-terre">
          Calendrier et invitations
        </a>
      </nav>

      <div className="mt-12 grid gap-16">
        {THEMES.map((t) => (
          <Section key={t.id} theme={t} />
        ))}

        <section id="calendrier" aria-labelledby="titre-calendrier" className="scroll-mt-24">
          <h2 id="titre-calendrier" className={titre2}>
            Calendrier sur quatre semaines
          </h2>
          <p className="mt-2 max-w-[70ch] text-base text-olive">
            Deux à trois publications par semaine, plus une story le jour de chaque publication. Ensuite, une école par semaine jusqu’aux neuf.
          </p>
          <ol className="mt-5 grid gap-2 sm:grid-cols-2">
            {CALENDRIER.map((c) => (
              <li key={`${c.semaine}-${c.jour}`} className="flex items-baseline gap-4 rounded-2xl bg-white px-5 py-3">
                <span className="w-32 shrink-0 text-sm text-olive">
                  Semaine {c.semaine} · {c.jour}
                </span>
                <span className="text-base text-encre">{c.publication}</span>
              </li>
            ))}
          </ol>

          <h2 className={`${titre2} mt-12`}>Messages d’invitation</h2>
          <ul className="mt-5 grid gap-4 lg:grid-cols-2">
            {INVITATIONS.map((m) => (
              <li key={m.titre} className="flex flex-col rounded-3xl bg-white p-5 sm:p-6">
                <h3 className="font-titre text-base font-semibold tracking-[-0.02em] text-vert">{m.titre}</h3>
                <p className="mt-3 whitespace-pre-line rounded-2xl bg-creme p-4 text-base leading-relaxed text-encre">{m.texte}</p>
                <div className="mt-4">
                  <BoutonCopier texte={m.texte} />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-base text-olive">
            Le message d’un membre à un collègue de promo, avec son code, est préparé par le site lui-même (page « Mes codes »).
          </p>
        </section>
      </div>
    </div>
  )
}
