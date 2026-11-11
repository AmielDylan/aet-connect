'use client'

// Proposition B · « Le bandeau » : dans la continuité de l'accueil de l'espace, un bandeau vert avec l'image de l'officier
// qui reçoit un code ; puis les codes en attente et le trombinoscope de ceux qui ont rejoint.
import { useState } from 'react'
import Image from 'next/image'
import { PHOTOS } from '@/lib/landing'
import { Portrait } from '@/components/espace/portrait'
import { CODES, EnteteMaquette, FormAdmin, Limite, Partage, QUOTA, Revoquer, date, etat, type CodeMaquette } from '../commun'

const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

export default function PropositionB() {
  const [admin, setAdmin] = useState(false)
  const [cree, setCree] = useState(false)
  const nouveau: CodeMaquette = { id: 'n', code: 'AET-Q7HD-3MWS', status: 'valid', created_at: '2026-11-11', expires_at: '2026-12-11' }
  const enAttente = [...(cree ? [nouveau] : []), ...CODES.filter((c) => c.status === 'valid')]
  const utilises = CODES.filter((c) => c.status === 'exhausted')
  const autres = CODES.filter((c) => c.status === 'expired' || c.status === 'revoked')
  const photo = PHOTOS.parcoursCode

  return (
    <>
      <EnteteMaquette admin={admin} setAdmin={setAdmin} />
      <main className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8 sm:pt-8">
        <section className="sur-vert trame trame-sur-vert grid overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert text-creme md:grid-cols-[1.1fr_1fr] md:rounded-tr-[76px]">
          <div className="flex flex-col justify-center gap-6 px-6 py-10 sm:px-10 lg:px-12 lg:py-12">
            <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">Vos invitations</h1>
            {admin ? (
              <div className="sur-creme rounded-2xl bg-creme p-5 text-encre">
                <FormAdmin />
              </div>
            ) : (
              <div className="grid gap-3">
                {cree ? (
                  <Limite surVert />
                ) : (
                  <p className="text-lg leading-relaxed text-brume">
                    Il vous reste <span className="font-semibold text-or">{QUOTA.remaining}</span> invitation sur {QUOTA.limit}. Un code sert une seule
                    fois et reste valable 30 jours.
                  </p>
                )}
                <span className="flex max-w-xs gap-1.5" aria-hidden="true">
                  {Array.from({ length: QUOTA.limit }, (_, i) => (
                    <span key={i} className={`h-2 flex-1 rounded-full ${i < QUOTA.used + (cree ? 1 : 0) ? 'bg-or' : 'bg-creme/25'}`} />
                  ))}
                </span>
              </div>
            )}
            {(admin || !cree) && <button
              type="button"
              onClick={() => setCree(true)}
              className="inline-flex min-h-12 items-center justify-center self-start rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors duration-200 hover:bg-white"
            >
              Créer un code
            </button>}
          </div>
          <div className="photo-cadre relative min-h-56 md:m-3 md:min-h-72 md:overflow-hidden md:rounded-[1.25rem] md:rounded-tr-[64px]">
            <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="photo-nb object-cover" />
            {/* La bulle de l'image porte le dernier code créé */}
            <span
              aria-hidden="true"
              className="absolute left-[60%] top-[39.5%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-creme px-2.5 py-1.5 font-titre text-[11px] font-semibold tracking-[0.04em] text-vert shadow-md after:absolute after:left-[25%] after:top-full after:border-x-[5px] after:border-t-[6px] after:border-x-transparent after:border-t-creme"
            >
              {enAttente[0]?.code}
            </span>
          </div>
        </section>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <section aria-labelledby="attente-b">
            <h2 id="attente-b" className={titre2}>
              En attente
            </h2>
            <ul className="mt-5 grid gap-3">
              {enAttente.map((c) => (
                <li key={c.id} className={`rounded-3xl p-5 sm:p-6 ${c.id === 'n' ? 'bg-white ring-2 ring-terre' : 'bg-white'}`}>
                  {c.id === 'n' && <p className="mb-1 text-sm text-terre">Votre nouveau code est prêt</p>}
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <span className="font-titre text-2xl font-bold tracking-[0.04em] text-vert">{c.code}</span>
                    <Revoquer c={c} />
                  </div>
                  <p className="text-base text-olive">{etat(c)}</p>
                  <div className="mt-3">
                    <Partage c={c} />
                  </div>
                </li>
              ))}
            </ul>
            {autres.length > 0 && (
              <p className="mt-5 text-base text-olive">
                {autres.map((c) => `${c.code} a expiré le ${date(c.expires_at)} sans avoir servi.`).join(' ')}
              </p>
            )}
          </section>

          <section aria-labelledby="rejoint-b">
            <h2 id="rejoint-b" className={titre2}>
              Ils ont rejoint grâce à vous
            </h2>
            <ul className="mt-5 grid grid-cols-3 gap-3">
              {utilises.map((c) => (
                <li key={c.id}>
                  <Portrait prenom={c.used_by!.first_name} nom={c.used_by!.last_name} className="aspect-square w-full rounded-2xl bg-sable text-2xl text-vert" />
                  <span className="mt-2 block text-sm text-encre">
                    {c.used_by!.first_name} {c.used_by!.last_name}
                  </span>
                  <span className="block text-sm text-olive">le {date(c.used_by!.used_at)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </>
  )
}
