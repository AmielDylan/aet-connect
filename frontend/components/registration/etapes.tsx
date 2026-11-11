export type Etape = { titre: string; detail?: string }

// Où l'on en est dans un parcours, en clair : « Étape 2/3 · Vos informations ».
// En colonne (panneau vert) : le compteur, puis la liste des étapes en texte, l'étape en cours mise en valeur.
export function Etapes({
  etapes,
  courante,
  tone = 'clair',
  orientation = 'ligne',
}: {
  etapes: Etape[]
  courante: number
  tone?: 'clair' | 'vert'
  orientation?: 'ligne' | 'colonne'
}) {
  const vert = tone === 'vert'
  const accent = vert ? 'text-or' : 'text-terre'
  const muted = vert ? 'text-brume' : 'text-olive'

  if (orientation === 'ligne') {
    return (
      <p className={`text-sm ${muted}`}>
        <span className={`font-titre font-semibold tracking-[-0.01em] ${accent}`}>
          Étape {courante}/{etapes.length}
        </span>
        <span aria-hidden="true"> · </span>
        <span className="sr-only">, </span>
        {etapes[courante - 1]?.titre}
      </p>
    )
  }

  return (
    <div>
      <p className={`mb-6 font-titre text-sm font-semibold tracking-[-0.01em] ${accent}`}>
        Étape {courante}/{etapes.length}
      </p>
      <ol aria-label="Les étapes" className="grid gap-6">
        {etapes.map((etape, i) => {
          const n = i + 1
          const actuelle = n === courante
          return (
            <li key={etape.titre} aria-current={actuelle ? 'step' : undefined} className={actuelle ? '' : 'opacity-60'}>
              <span className={`block font-titre text-lg font-semibold tracking-[-0.02em] ${actuelle ? accent : vert ? 'text-creme' : 'text-vert'}`}>
                {etape.titre}
              </span>
              {etape.detail && <span className={`mt-1 block text-base ${muted}`}>{etape.detail}</span>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
