'use client'

// « Mes codes » · proposition B « Le bandeau » : dans la continuité de l'accueil de l'espace, un bandeau vert avec
// l'officier qui reçoit un code (la bulle porte votre dernier code), puis les codes en attente et ceux qui ont rejoint.
import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/hooks/use-auth'
import { PHOTOS } from '@/lib/landing'
import { PhotoFrame } from '@/components/landing/photo-frame'
import { Portrait } from '@/components/espace/portrait'
import { CreationAdmin, Partage, Revoquer, dateLongue, etatCode } from '@/components/espace/codes'

const N = ' '
const titre2 = 'font-titre text-xl font-semibold tracking-[-0.02em] text-vert'

export default function MesCodes() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isAdmin = user?.role === 'admin'
  const [nouveau, setNouveau] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery({ queryKey: ['my-codes'], queryFn: () => apiClient.getMyCodes() })
  const { data: historique } = useQuery({ queryKey: ['codes-history'], queryFn: () => apiClient.getCodesHistory() })

  const creer = useMutation({
    mutationFn: () => apiClient.generateCode(),
    onSuccess: (r) => {
      setNouveau(r.code)
      queryClient.invalidateQueries({ queryKey: ['my-codes'] })
    },
  })

  if (!user) return null

  const quota = data?.quota
  const codes = [...(data?.codes ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))
  const enAttente = codes.filter((c) => c.status === 'valid')
  const sansSuite = codes.filter((c) => c.status === 'expired' || c.status === 'revoked')
  const rejoints = (historique?.codes ?? []).filter((h) => h.used_by)
  const illimite = quota?.limit === null
  const plusAucune = !!quota && !illimite && quota.remaining === 0
  const notrePromo = (schoolId: string, annee: string) => schoolId === user.school_id && annee === user.entry_year

  return (
    <div>
      {/* Bandeau : côte à côte dès lg seulement (la photo, plus large, donne la hauteur ; le texte est centré) ;
          avant, la photo passe sous le texte. Coin haut droit 76px, photo concentrique 64px ; la bulle porte le dernier code */}
      <section className="sur-vert trame trame-sur-vert grid overflow-hidden rounded-3xl rounded-tr-[56px] bg-vert text-creme lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-start lg:rounded-tr-[76px]">
        <div className="flex flex-col justify-center gap-6 self-center px-6 py-10 sm:px-10 lg:px-12">
          <h1 className="font-titre text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.05] tracking-[-0.03em]">Vos invitations</h1>
          {isAdmin ? (
            <div className="sur-creme rounded-2xl bg-creme p-5 text-encre">
              <CreationAdmin onCree={setNouveau} />
            </div>
          ) : (
            quota && (
              <div className="grid max-w-xl gap-3">
                {plusAucune ? (
                  <p className="text-lg leading-relaxed text-brume">
                    Vos {quota.limit} invitations sont en cours ou utilisées. Un code qui expire ou que vous révoquez sans qu’il ait servi vous en rend
                    une.
                    {user.role === 'alumni' && !user.is_ambassador && ' Les ambassadeurs de promo en ont 15.'}
                  </p>
                ) : (
                  <p className="text-lg leading-relaxed text-brume">
                    {illimite ? (
                      'Vous pouvez créer autant de codes que nécessaire.'
                    ) : (
                      <>
                        Il vous reste <span className="font-semibold text-or">{quota.remaining}</span> {quota.remaining === 1 ? 'invitation' : 'invitations'}{' '}
                        sur {quota.limit}.
                      </>
                    )}{' '}
                    Un code sert une seule fois et reste valable 30 jours.
                  </p>
                )}
                {!illimite && quota.limit !== null && quota.limit > 0 && (
                  <span className="flex max-w-xs gap-1.5" aria-hidden="true">
                    {Array.from({ length: quota.limit }, (_, i) => (
                      <span key={i} className={`h-2 flex-1 rounded-full ${i < quota.used ? 'bg-or' : 'bg-creme/25'}`} />
                    ))}
                  </span>
                )}
                {!plusAucune && (
                  <button
                    type="button"
                    onClick={() => creer.mutate()}
                    disabled={creer.isPending}
                    className="mt-3 inline-flex min-h-12 items-center justify-center gap-2 justify-self-start rounded-full bg-creme px-7 text-base font-semibold text-vert transition-colors duration-200 hover:bg-white disabled:opacity-60"
                  >
                    {creer.isPending && <Loader2 className="size-[18px] animate-spin" aria-hidden="true" />}
                    Créer un code
                  </button>
                )}
                {creer.isError && (
                  <p role="alert" className="text-base font-semibold text-or">
                    Le code n’a pas pu être créé. Vous pouvez réessayer dans un instant.
                  </p>
                )}
              </div>
            )
          )}
        </div>
        <div className="m-3 mt-0 lg:mt-3">
          <PhotoFrame
            photo={PHOTOS.parcoursCode}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="aspect-[1312/816] rounded-[1.25rem] lg:rounded-tr-[64px]"
            bulle={enAttente[0]?.code ?? nouveau ?? undefined}
          />
        </div>
      </section>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <section aria-labelledby="attente">
          <h2 id="attente" className={titre2}>
            En attente
          </h2>
          {isLoading ? (
            <div className="mt-5 h-40 animate-pulse rounded-3xl bg-sable/60" aria-hidden="true" />
          ) : isError ? (
            <p className="mt-4 text-base text-olive">Vos codes n’ont pas pu être chargés. Vous pouvez recharger la page dans un instant.</p>
          ) : enAttente.length === 0 ? (
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-olive">
              Aucun code en attente.{' '}
              {plusAucune ? '' : `Avec «${N}Créer un code${N}», vous pouvez inviter un collègue de votre promo.`}
            </p>
          ) : (
            <ul className="mt-5 grid gap-3">
              {enAttente.map((c) => {
                const frais = c.code === nouveau
                return (
                  <li key={c.id} className={`rounded-3xl bg-white p-5 sm:p-6 ${frais ? 'ring-2 ring-terre' : ''}`}>
                    {frais && <p className="mb-1 text-sm text-terre">Votre nouveau code est prêt</p>}
                    <p className="font-titre text-2xl font-bold tracking-[0.04em] text-vert">{c.code}</p>
                    <p className="mt-1 text-base text-olive">
                      {isAdmin && (c.schools?.name_fr ? `${c.schools.name_fr} · promo ${c.entry_year} · ` : 'Code universel · ')}
                      {etatCode(c)}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
                      <Partage c={c} notrePromo={notrePromo(c.school_id, c.entry_year)} />
                      {c.current_uses === 0 && <Revoquer c={c} />}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {sansSuite.length > 0 && (
            <ul className="mt-5 grid gap-1 text-base text-olive">
              {sansSuite.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <span className="tracking-[0.04em]">{c.code}</span> · {etatCode(c).toLowerCase()}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="rejoints">
          <h2 id="rejoints" className={titre2}>
            Ils ont rejoint grâce à vous
          </h2>
          {rejoints.length === 0 ? (
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-olive">
              Personne n’a encore utilisé vos codes. Dès qu’un collègue s’inscrit avec l’un d’eux, il apparaît ici.
            </p>
          ) : (
            <ul className="mt-5 grid grid-cols-3 gap-3">
              {rejoints.map((h) => (
                <li key={h.id}>
                  <Link href={`/profile/${h.used_by!.id}`} className="group block">
                    <Portrait
                      prenom={h.used_by!.first_name}
                      nom={h.used_by!.last_name}
                      className="aspect-square w-full rounded-2xl bg-sable text-2xl text-vert transition-colors duration-200 group-hover:bg-vert group-hover:text-creme"
                    />
                    <span className="mt-2 block text-sm text-encre group-hover:text-terre">
                      {h.used_by!.first_name} {h.used_by!.last_name}
                    </span>
                    <span className="block text-sm text-olive">le {dateLongue(h.used_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
