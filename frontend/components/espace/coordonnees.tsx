'use client'

// Les coordonnées qu'un membre a choisi de montrer (les champs masqués arrivent à null), et rien d'autre
import { useState } from 'react'
import { Check, Copy, Linkedin, Mail, Phone } from 'lucide-react'

export function Coordonnees({
  prenom,
  email,
  phone,
  linkedin,
}: {
  prenom: string
  email?: string | null
  phone?: string | null
  linkedin?: string | null
}) {
  const [copie, setCopie] = useState(false)
  // Saisi par le membre : seul un lien web est affiché (jamais javascript:, data:…)
  const lienWeb = linkedin && /^https?:\/\//i.test(linkedin.trim()) ? linkedin.trim() : null
  if (!email && !phone && !lienWeb) {
    return <p className="text-base leading-relaxed text-olive">{prenom} n’a pas rendu ses coordonnées visibles.</p>
  }
  const ligne = 'flex min-h-12 items-center gap-3 rounded-2xl bg-creme px-4 text-base text-encre transition-colors hover:text-terre'
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(email!)
      setCopie(true)
      setTimeout(() => setCopie(false), 2000)
    } catch {
      /* presse-papier refusé : l'adresse reste visible et cliquable */
    }
  }
  return (
    <ul className="grid grid-cols-[minmax(0,1fr)] gap-2">
      {email && (
        <li className="flex items-center gap-2">
          <a href={`mailto:${email}`} className={`${ligne} min-w-0 flex-1`}>
            <Mail className="size-[18px] shrink-0 text-vert" aria-hidden="true" />
            <span className="truncate">{email}</span>
          </a>
          <button
            type="button"
            onClick={copier}
            className="grid size-12 shrink-0 place-items-center rounded-full text-vert transition-colors hover:bg-sable/60 hover:text-terre"
            aria-label={copie ? 'Adresse copiée' : 'Copier l’adresse email'}
          >
            {copie ? <Check className="size-[18px]" aria-hidden="true" /> : <Copy className="size-[18px]" aria-hidden="true" />}
          </button>
        </li>
      )}
      {phone && (
        <li>
          <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className={ligne}>
            <Phone className="size-[18px] shrink-0 text-vert" aria-hidden="true" />
            {phone}
          </a>
        </li>
      )}
      {lienWeb && (
        <li>
          <a href={lienWeb} target="_blank" rel="noopener noreferrer" className={ligne}>
            <Linkedin className="size-[18px] shrink-0 text-vert" aria-hidden="true" />
            Son profil LinkedIn
          </a>
        </li>
      )}
    </ul>
  )
}
